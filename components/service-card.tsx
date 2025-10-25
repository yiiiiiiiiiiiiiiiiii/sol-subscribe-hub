"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/types";
import { Users } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  service: Service;
  onSubscribe?: (service: Service) => void;
  isSubscribed?: boolean;
}

export function ServiceCard({
  service,
  onSubscribe,
  isSubscribed,
}: ServiceCardProps) {
  const getLowestPrice = () => {
    const prices = [
      service.monthly_price,
      service.quarterly_price,
      service.yearly_price,
    ].filter((p) => p !== null && p !== undefined);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "AI & ML": "bg-primary/10 text-primary",
      "Data & Analytics": "bg-accent/10 text-accent",
      NFT: "bg-chart-3/10 text-chart-3",
      DeFi: "bg-chart-4/10 text-chart-4",
      Security: "bg-chart-5/10 text-chart-5",
      Social: "bg-chart-2/10 text-chart-2",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge className={getCategoryColor(service.category)}>
            {service.category}
          </Badge>
          {isSubscribed && <Badge variant="outline">Subscribed</Badge>}
        </div>
        <CardTitle className="text-xl">{service.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {service.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{service.subscribers_count} subscribers</span>
          </div>

          {service.features.length > 0 && (
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Features:</p>
              <ul className="space-y-1">
                {service.features.slice(0, 3).map((feature, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-2xl font-bold">
            {getLowestPrice().toFixed(2)} SOL
          </p>
          <p className="text-xs text-muted-foreground">starting from</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/service/${service.id}`}>View</Link>
          </Button>
          {onSubscribe && (
            <Button
              onClick={() => onSubscribe(service)}
              disabled={isSubscribed}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
