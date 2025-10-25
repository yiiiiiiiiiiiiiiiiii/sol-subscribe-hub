"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ServiceCard } from "@/components/service-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/client";
import { useSolana } from "@/lib/solana-provider";
import type { Service } from "@/lib/types";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  { value: "all", label: "All" },
  { value: "AI & ML", label: "AI & ML" },
  { value: "Data & Analytics", label: "Data & Analytics" },
  { value: "NFT", label: "NFT" },
  { value: "DeFi", label: "DeFi" },
  { value: "Security", label: "Security" },
  { value: "Social", label: "Social" },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { selectedAccount } = useSolana();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subscribedServiceIds, setSubscribedServiceIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, [selectedAccount?.address]);

  const loadServices = async () => {
    try {
      const supabase = createBrowserClient();

      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (servicesError) throw servicesError;

      setServices(servicesData || []);
      setFilteredServices(servicesData || []);

      // Load subscriptions if wallet is connected
      if (selectedAccount?.address) {
        const { data: subscriptionsData, error: subscriptionsError } =
          await supabase
            .from("subscriptions")
            .select("service_id")
            .eq("subscriber_address", selectedAccount?.address)
            .eq("status", "active");

        if (!subscriptionsError && subscriptionsData) {
          const subscribedIds = new Set(
            subscriptionsData.map((s) => s.service_id)
          );
          setSubscribedServiceIds(subscribedIds);
        }
      }
    } catch (error) {
      console.error("[v0] Error loading services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = services;

    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (service) => service.category === categoryFilter
      );
    }

    setFilteredServices(filtered);
  }, [searchQuery, categoryFilter, services]);

  const handleSubscribe = (service: Service) => {
    router.push(`/service/${service.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Services</h1>
          <p className="text-muted-foreground">
            Browse and subscribe to services on the Solana network
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                variant={
                  categoryFilter === category.value ? "default" : "outline"
                }
                className={`whitespace-nowrap ${
                  categoryFilter !== category.value
                    ? "hover:bg-primary/10 hover:text-primary"
                    : ""
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No services found
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to publish a service!"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSubscribe={handleSubscribe}
                isSubscribed={subscribedServiceIds.has(service.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
