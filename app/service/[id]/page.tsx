"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSolana } from "@/lib/solana-provider";
import type { Service, Subscription, SubscriptionPlan } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Users,
  Check,
  ExternalLink,
  Globe,
  Webhook,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, selectedAccount } = useSolana();
  const { toast } = useToast();

  const [service, setService] = useState<Service | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("monthly");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [webhookFieldsData, setWebhookFieldsData] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const serviceId = params.id as string;
    const loadService = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (error) {
        console.error("Error loading service:", error);
        setService(null);
        return;
      }

      setService(data);

      if (selectedAccount?.address && data) {
        // Check if user is subscribed
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("service_id", serviceId)
          .eq("subscriber_address", selectedAccount.address)
          .eq("status", "active")
          .single();

        setIsSubscribed(!!subscription);
        if (data.yearly_price) {
          setSelectedPlan("yearly");
        } else if (data.quarterly_price) {
          setSelectedPlan("quarterly");
        } else if (data.monthly_price) {
          setSelectedPlan("monthly");
        }
        setAutoRenewal(data.auto_renewal);
      }
    };

    loadService();
  }, [params.id, selectedAccount?.address]);

  const handleSubscribe = async () => {
    if (!isConnected || !selectedAccount?.address || !service) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to subscribe",
        variant: "destructive",
      });
      return;
    }

    // Check if service has custom fields that require webhook data
    if (service.custom_fields && service.custom_fields.length > 0) {
      setShowWebhookDialog(true);
      return;
    }

    // If no custom fields, proceed directly
    await processSubscription({});
  };

  const processSubscription = async (webhookData: Record<string, string>) => {
    setIsSubscribing(true);

    try {
      const startDate = new Date();
      const endDate = new Date(startDate);
      switch (selectedPlan) {
        case "monthly":
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case "quarterly":
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case "yearly":
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      const subscription: Subscription = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        service_id: service!.id,
        subscriber_address: selectedAccount!.address,
        plan: selectedPlan,
        price: getPlanPrice(selectedPlan),
        auto_renewal: autoRenewal,
        status: "pending" as const,
        webhook_data: webhookData,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        created_at: new Date().toISOString(),
      };

      // Save pending subscription to Supabase
      const supabase = createClient();
      const { error: subError } = await supabase
        .from("subscriptions")
        .insert(subscription);

      if (subError) {
        throw subError;
      }

      // Simulate Solana transaction (0.001 SOL to service hash)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTxHash = `tx-${Math.random().toString(36).substr(2, 16)}`;

      // Update subscription status to paid
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "paid",
          transaction_hash: mockTxHash,
        })
        .eq("id", subscription.id);

      if (updateError) {
        throw updateError;
      }

      // Call webhook if URL exists
      if (service!.webhook_url) {
        try {
          await fetch(service!.webhook_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event: "subscription_activated",
              subscription_id: subscription.id,
              service_id: service!.id,
              subscriber_address: selectedAccount!.address,
              plan: selectedPlan,
              price: getPlanPrice(selectedPlan),
              webhook_data: webhookData,
              transaction_hash: mockTxHash,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (webhookError) {
          console.error("Webhook call failed:", webhookError);
          // Don't fail the subscription for webhook errors
        }
      }

      // Update subscription status to active
      const { error: activateError } = await supabase
        .from("subscriptions")
        .update({ status: "active" })
        .eq("id", subscription.id);

      if (activateError) {
        throw activateError;
      }

      // Update subscriber count
      const { error: countError } = await supabase
        .from("services")
        .update({ subscribers_count: service!.subscribers_count + 1 })
        .eq("id", service!.id);

      if (countError) {
        console.error("Error updating subscriber count:", countError);
      }

      toast({
        title: "Subscription successful",
        description: `You are now subscribed to ${service!.name}`,
      });

      setIsSubscribed(true);
      setService({
        ...service!,
        subscribers_count: service!.subscribers_count + 1,
      });
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
      setShowWebhookDialog(false);
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Service Not Found</CardTitle>
              <CardDescription>
                The service you are looking for does not exist
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  const getPlanLabel = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      case "yearly":
        return "Yearly";
    }
  };

  const getPlanDuration = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "monthly":
        return "1 month";
      case "quarterly":
        return "3 months";
      case "yearly":
        return "12 months";
    }
  };

  const getPlanPrice = (plan: SubscriptionPlan): number => {
    switch (plan) {
      case "monthly":
        return service.monthly_price || 0;
      case "quarterly":
        return service.quarterly_price || 0;
      case "yearly":
        return service.yearly_price || 0;
    }
  };

  const selectedPrice = getPlanPrice(selectedPlan);

  const handleWebhookSubmit = () => {
    // Validate required fields
    if (service?.custom_fields) {
      for (const field of service.custom_fields) {
        if (field.required && !webhookFieldsData[field.name]?.trim()) {
          toast({
            title: "Required field missing",
            description: `Please fill in ${field.name}`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    processSubscription(webhookFieldsData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Webhook Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Please provide the required information for this service
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {service?.custom_fields?.map((field, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={field.name} className="flex items-center gap-2">
                  {field.name}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={field.name}
                  type={
                    field.type === "email"
                      ? "email"
                      : field.type === "number"
                      ? "number"
                      : "text"
                  }
                  placeholder={`Enter your ${field.name}`}
                  value={webhookFieldsData[field.name] || ""}
                  onChange={(e) =>
                    setWebhookFieldsData({
                      ...webhookFieldsData,
                      [field.name]: e.target.value,
                    })
                  }
                  required={field.required}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWebhookDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleWebhookSubmit} disabled={isSubscribing}>
              {isSubscribing ? "Processing..." : "Subscribe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discovery
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card className="border-2">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {service.category}
                  </Badge>
                  {isSubscribed && (
                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                      <Check className="h-3 w-3 mr-1" />
                      Subscribed
                    </Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-4xl mb-3 text-balance">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="text-lg text-pretty leading-relaxed">
                    {service.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">
                      {service.subscribers_count}
                    </span>
                    <span className="text-sm">subscribers</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm">Verified Publisher</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Features Section */}
            {service.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Features & Benefits
                  </CardTitle>
                  <CardDescription>
                    Everything included in your subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {service.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="mt-0.5 p-1 rounded-full bg-primary/10">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Publisher Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Publisher Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Publisher Name
                    </p>
                    <p className="font-medium">Publisher</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Wallet Address
                    </p>
                    <p className="font-mono text-sm">
                      {service.publisher_address.slice(0, 8)}...
                      {service.publisher_address.slice(-8)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Choose Your Plan</CardTitle>
                  <CardDescription>
                    Select a subscription plan that works for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isSubscribed &&
                    (service.monthly_price ||
                      service.quarterly_price ||
                      service.yearly_price) && (
                      <div className="space-y-3">
                        {["monthly", "quarterly", "yearly"].map((plan) => {
                          const price = getPlanPrice(plan as SubscriptionPlan);
                          if (!price) return null;
                          return (
                            <button
                              key={plan}
                              className={`w-full p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
                                selectedPlan === plan
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "hover:border-primary/50 hover:bg-muted/50"
                              }`}
                              onClick={() =>
                                setSelectedPlan(plan as SubscriptionPlan)
                              }
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-base">
                                    {getPlanLabel(plan as SubscriptionPlan)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {getPlanDuration(plan as SubscriptionPlan)}
                                  </p>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    selectedPlan === plan
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground/30"
                                  }`}
                                >
                                  {selectedPlan === plan && (
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  )}
                                </div>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">
                                  {price}
                                </span>
                                <span className="text-lg font-semibold text-muted-foreground">
                                  SOL
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {isSubscribed && selectedPrice > 0 && (
                    <div className="text-center py-4">
                      <p className="text-5xl font-bold mb-2">{selectedPrice}</p>
                      <p className="text-lg font-medium text-muted-foreground">
                        SOL / {selectedPlan}
                      </p>
                    </div>
                  )}

                  {!isSubscribed && service.auto_renewal && (
                    <>
                      <Separator />
                      <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                        <Checkbox
                          id="autoRenewal"
                          checked={autoRenewal}
                          onCheckedChange={(checked) =>
                            setAutoRenewal(checked as boolean)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="autoRenewal"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Enable auto-renewal
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Automatically renew your subscription when it
                            expires
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {isConnected ? (
                    <Button
                      onClick={handleSubscribe}
                      disabled={isSubscribed || isSubscribing}
                      size="lg"
                      className="w-full text-base h-12"
                    >
                      {isSubscribing ? (
                        <>
                          <span className="animate-pulse">
                            Processing Transaction...
                          </span>
                        </>
                      ) : isSubscribed ? (
                        "Already Subscribed"
                      ) : (
                        `Subscribe for ${selectedPrice} SOL`
                      )}
                    </Button>
                  ) : (
                    <div className="text-center p-6 bg-muted/50 rounded-lg border-2 border-dashed">
                      <p className="text-sm font-medium mb-1">
                        Wallet Required
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Connect your wallet to subscribe to this service
                      </p>
                    </div>
                  )}

                  {isSubscribed && (
                    <div className="p-4 bg-green-500/10 border-2 border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-600 font-medium mb-1">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Active Subscription</span>
                      </div>
                      <p className="text-xs text-green-600/80">
                        You have full access to this service
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Secure payments on Solana blockchain</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Instant access after subscription</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Full API documentation included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
