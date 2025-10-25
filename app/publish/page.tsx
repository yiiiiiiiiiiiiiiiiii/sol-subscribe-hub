"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSolana } from "@/lib/solana-provider";
import { createClient } from "@/lib/supabase/client";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PublishPage() {
  const router = useRouter();
  const { isConnected, selectedAccount } = useSolana();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    webhookUrl: "",
    autoRenewalEnabled: false,
  });

  const [pricingOptions, setPricingOptions] = useState({
    monthly: { price: 0, enabled: true },
    quarterly: { price: 0, enabled: false },
    yearly: { price: 0, enabled: false },
  });

  const [features, setFeatures] = useState<string[]>([""]);

  const [webhookFields, setWebhookFields] = useState<
    { name: string; type: string; required: boolean }[]
  >([{ name: "", type: "text", required: false }]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePricingChange = (
    plan: "monthly" | "quarterly" | "yearly",
    field: "price" | "enabled",
    value: any
  ) => {
    setPricingOptions((prev) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [field]: field === "price" ? Number(value) : value,
      },
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !selectedAccount?.address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to publish a service",
        variant: "destructive",
      });
      return;
    }

    const hasEnabledPlan = Object.values(pricingOptions).some(
      (opt) => opt.enabled
    );
    if (!hasEnabledPlan) {
      toast({
        title: "No pricing options",
        description: "Please enable at least one subscription plan",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("services")
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          publisher_address: selectedAccount.address,
          features: features.filter((f) => f.trim() !== ""),
          webhook_url: formData.webhookUrl,
          webhook_events: [
            "subscription_activated",
            "subscription_renewed",
            "subscription_cancelled",
          ],
          custom_fields: webhookFields
            .filter((f) => f.name.trim() !== "")
            .map((f) => ({
              name: f.name,
              type: f.type,
              required: f.required,
            })),
          monthly_price: pricingOptions.monthly.enabled
            ? pricingOptions.monthly.price
            : null,
          quarterly_price: pricingOptions.quarterly.enabled
            ? pricingOptions.quarterly.price
            : null,
          yearly_price: pricingOptions.yearly.enabled
            ? pricingOptions.yearly.price
            : null,
          auto_renewal: formData.autoRenewalEnabled,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Service published successfully",
        description: "Your service is now live and discoverable",
      });

      router.push("/discover");
    } catch (error) {
      console.error("[v0] Error publishing service:", error);
      toast({
        title: "Failed to publish service",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                You need to connect your wallet to publish a service
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Publish Your Service</h1>
            <p className="text-muted-foreground">
              Create a subscription service and start building your subscriber
              base
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
                <CardDescription>
                  Provide details about your service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Premium API Access"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your service offers..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI & ML">AI & ML</SelectItem>
                      <SelectItem value="Data & Analytics">
                        Data & Analytics
                      </SelectItem>
                      <SelectItem value="NFT">NFT</SelectItem>
                      <SelectItem value="DeFi">DeFi</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="e.g., Unlimited API calls"
                          value={feature}
                          onChange={(e) =>
                            handleFeatureChange(index, e.target.value)
                          }
                        />
                        {features.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    className="gap-2 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Pricing & Subscription Plans</CardTitle>
                <CardDescription>
                  Configure subscription options and pricing for your service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {(["monthly", "quarterly", "yearly"] as const).map((plan) => (
                    <div
                      key={plan}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Checkbox
                        id={`enable-${plan}`}
                        checked={pricingOptions[plan].enabled}
                        onCheckedChange={(checked) =>
                          handlePricingChange(plan, "enabled", checked)
                        }
                      />
                      <div className="flex-1 grid grid-cols-2 gap-4 items-center">
                        <Label
                          htmlFor={`enable-${plan}`}
                          className="capitalize cursor-pointer"
                        >
                          {plan} Subscription
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={pricingOptions[plan].price || ""}
                            onChange={(e) =>
                              handlePricingChange(plan, "price", e.target.value)
                            }
                            disabled={!pricingOptions[plan].enabled}
                            className="max-w-[150px]"
                          />
                          <span className="text-sm text-muted-foreground">
                            SOL
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="autoRenewal"
                    checked={formData.autoRenewalEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        autoRenewalEnabled: checked as boolean,
                      })
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="autoRenewal"
                      className="cursor-pointer font-medium"
                    >
                      Enable Auto-Renewal
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow subscribers to automatically renew their
                      subscription when it expires
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Configure webhook for your service integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://your-api.com/webhook"
                    value={formData.webhookUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, webhookUrl: e.target.value })
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about subscription events and handle
                    user activation
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Additional User Information Fields</Label>
                  <p className="text-sm text-muted-foreground">
                    Define custom fields to collect from users during
                    subscription (optional)
                  </p>
                  <div className="space-y-2">
                    {webhookFields.map((field, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Field name (e.g., email, username)"
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...webhookFields];
                            newFields[index].name = e.target.value;
                            setWebhookFields(newFields);
                          }}
                        />
                        <Select
                          value={field.type}
                          onValueChange={(value) => {
                            const newFields = [...webhookFields];
                            newFields[index].type = value;
                            setWebhookFields(newFields);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={field.required}
                            onCheckedChange={(checked) => {
                              const newFields = [...webhookFields];
                              newFields[index].required = checked as boolean;
                              setWebhookFields(newFields);
                            }}
                          />
                          <Label className="text-sm">Required</Label>
                        </div>
                        {webhookFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setWebhookFields(
                                webhookFields.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setWebhookFields([
                        ...webhookFields,
                        { name: "", type: "text", required: false },
                      ]);
                    }}
                    className="gap-2 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                    Add Field
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Publishing..." : "Publish Service"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
