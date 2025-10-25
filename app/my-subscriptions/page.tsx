"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSolana } from "@/lib/solana-provider";
import type { Service, Subscription } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SubscriptionWithService extends Subscription {
  service: Service | null;
}

export default function MySubscriptionsPage() {
  const { isConnected, selectedAccount } = useSolana();
  const [activeSubscriptions, setActiveSubscriptions] = useState<
    SubscriptionWithService[]
  >([]);
  const [expiredSubscriptions, setExpiredSubscriptions] = useState<
    SubscriptionWithService[]
  >([]);

  useEffect(() => {
    if (!selectedAccount?.address) return;

    const loadSubscriptions = async () => {
      const supabase = createClient();

      // Fetch user's subscriptions with service details
      const { data: userSubscriptions, error } = await supabase
        .from("subscriptions")
        .select(
          `
          *,
          services (
            id,
            name,
            description,
            category,
            callback_url,
            webhook_url,
            webhook_events
          )
        `
        )
        .eq("subscriber_address", selectedAccount.address);

      if (error) {
        console.error("Error loading subscriptions:", error);
        return;
      }

      const subscriptionsWithServices = (userSubscriptions || []).map(
        (sub: any) => ({
          ...sub,
          service: sub.services || null,
        })
      );

      setActiveSubscriptions(
        subscriptionsWithServices.filter((s: any) => s.status === "active")
      );
      setExpiredSubscriptions(
        subscriptionsWithServices.filter((s: any) => s.status !== "active")
      );
    };

    loadSubscriptions();
  }, [selectedAccount]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                You need to connect your wallet to view your subscriptions
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const SubscriptionCard = ({
    subscription,
  }: {
    subscription: SubscriptionWithService;
  }) => {
    if (!subscription.service) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 mb-2">
            <Badge>{subscription.service.category}</Badge>
            <Badge
              variant={
                subscription.status === "active" ? "default" : "secondary"
              }
            >
              {subscription.status}
            </Badge>
          </div>
          <CardTitle>{subscription.service.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {subscription.service.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Subscribed on {formatDate(subscription.start_date)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Transaction:</span>
            <span className="font-mono text-xs">
              {subscription.transaction_hash}
            </span>
          </div>

          {subscription.service.callback_url && (
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <Link
                href={subscription.service.callback_url}
                target="_blank"
                className="text-primary hover:underline truncate"
              >
                Access Service
              </Link>
            </div>
          )}

          <div className="pt-2 border-t">
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href={`/service/${subscription.service.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your active and past subscriptions
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({expiredSubscriptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeSubscriptions.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Subscriptions</CardTitle>
                  <CardDescription>
                    You do not have any active subscriptions yet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/discover">Discover Services</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSubscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-6">
            {expiredSubscriptions.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Expired Subscriptions</CardTitle>
                  <CardDescription>
                    You do not have any expired subscriptions
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredSubscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
