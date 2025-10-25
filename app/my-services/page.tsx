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
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  Settings,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface ServiceWithStats extends Service {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  recentSubscriptions: Subscription[];
}

export default function MyServicesPage() {
  const { isConnected, selectedAccount } = useSolana();
  const [services, setServices] = useState<ServiceWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedAccount?.address) {
      setLoading(false);
      return;
    }

    const loadMyServices = async () => {
      const supabase = createClient();

      // Fetch user's services
      const { data: userServices, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("publisher_address", selectedAccount.address);

      if (servicesError) {
        console.error("Error loading services:", servicesError);
        setLoading(false);
        return;
      }

      // For each service, get subscription stats
      const servicesWithStats = await Promise.all(
        (userServices || []).map(async (service) => {
          // Get all subscriptions for this service
          const { data: subscriptions, error: subsError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("service_id", service.id);

          if (subsError) {
            console.error("Error loading subscriptions:", subsError);
            return {
              ...service,
              totalSubscriptions: 0,
              activeSubscriptions: 0,
              totalRevenue: 0,
              recentSubscriptions: [],
            };
          }

          const activeSubscriptions =
            subscriptions?.filter((sub) => sub.status === "active") || [];
          const totalRevenue =
            subscriptions?.reduce((sum, sub) => sum + (sub.price || 0), 0) || 0;
          const recentSubscriptions =
            subscriptions
              ?.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              ?.slice(0, 5) || [];

          return {
            ...service,
            totalSubscriptions: subscriptions?.length || 0,
            activeSubscriptions: activeSubscriptions.length,
            totalRevenue,
            recentSubscriptions,
          };
        })
      );

      setServices(servicesWithStats);
      setLoading(false);
    };

    loadMyServices();
  }, [selectedAccount?.address]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                You need to connect your wallet to view your services
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">Loading your services...</div>
        </main>
      </div>
    );
  }

  const totalRevenue = services.reduce(
    (sum, service) => sum + service.totalRevenue,
    0
  );
  const totalSubscriptions = services.reduce(
    (sum, service) => sum + service.totalSubscriptions,
    0
  );
  const activeSubscriptions = services.reduce(
    (sum, service) => sum + service.activeSubscriptions,
    0
  );

  const ServiceCard = ({ service }: { service: ServiceWithStats }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 mb-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {service.category}
          </Badge>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/service/${service.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/publish?id=${service.id}`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg">{service.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Subs</p>
            <p className="text-2xl font-bold">{service.totalSubscriptions}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {service.activeSubscriptions}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-lg font-semibold">{service.totalRevenue} SOL</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Monthly</p>
            <p className="text-lg font-semibold">
              {service.monthly_price ? `${service.monthly_price} SOL` : "N/A"}
            </p>
          </div>
        </div>

        {service.recentSubscriptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Subscriptions</p>
            <div className="space-y-1">
              {service.recentSubscriptions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-mono">
                    {sub.subscriber_address.slice(0, 6)}...
                    {sub.subscriber_address.slice(-4)}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Services</h1>
            <p className="text-muted-foreground">
              Manage your published services and track performance
            </p>
          </div>
          <Button asChild>
            <Link href="/publish">
              <Plus className="h-4 w-4 mr-2" />
              Publish New Service
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Services
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscriptions
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {activeSubscriptions} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue} SOL</div>
            </CardContent>
          </Card>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Services Published</CardTitle>
              <CardDescription>
                You haven't published any services yet. Start by creating your
                first service.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/publish">
                  <Plus className="h-4 w-4 mr-2" />
                  Publish Your First Service
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
