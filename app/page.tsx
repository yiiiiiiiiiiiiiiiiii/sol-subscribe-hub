"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Shield, Bell, Rocket, Check } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Decentralized Solana Subscription Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Create and discover services through blockchain-powered
            subscriptions. Fast, secure, and transparent.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/discover">Discover Services →</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/publish">Publish Service</Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-500 mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Built on Solana for instant transactions and real-time updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-500 mb-4" />
              <CardTitle>Secure & Transparent</CardTitle>
              <CardDescription>
                All subscriptions recorded on-chain, fully transparent and
                traceable
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 text-green-500 mb-4" />
              <CardTitle>Real-time Notifications</CardTitle>
              <CardDescription>
                Get instant updates when publishers send messages
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Publishers */}
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Rocket className="h-8 w-8 text-purple-500" />
                  <CardTitle className="text-2xl">For Publishers</CardTitle>
                </div>
                <CardDescription>
                  Create and manage your subscription services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Create Service</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Set up your service details and pricing
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Configure Webhooks</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Set callback URLs for subscription events
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Manage Subscribers</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Send updates and notifications to your subscribers
                    </p>
                  </div>
                </div>

                <Button asChild className="w-full mt-4" size="lg">
                  <Link href="/publish">Start Publishing</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Subscribers */}
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Check className="h-8 w-8 text-green-500" />
                  <CardTitle className="text-2xl">For Subscribers</CardTitle>
                </div>
                <CardDescription>
                  Discover and subscribe to services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Connect Wallet</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Use Phantom or any Solana wallet
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Browse Services</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Discover services by category or search
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Subscribe with SOL</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Pay and receive instant access to services
                    </p>
                  </div>
                </div>

                <Button asChild className="w-full mt-4" size="lg">
                  <Link href="/discover">Explore Services</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Services Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Services</h2>
              <p className="text-muted-foreground">
                Explore the most popular services on the platform
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/discover">View All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Service Cards */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    AI & ML
                  </span>
                </div>
                <CardTitle>AI Content Generator</CardTitle>
                <CardDescription>
                  Generate high-quality content using advanced AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">0.5 SOL</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <Button asChild>
                    <Link href="/discover">View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    Data
                  </span>
                </div>
                <CardTitle>Market Data API</CardTitle>
                <CardDescription>
                  Real-time cryptocurrency market data and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">0.3 SOL</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <Button asChild>
                    <Link href="/discover">View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    NFT
                  </span>
                </div>
                <CardTitle>NFT Minting Service</CardTitle>
                <CardDescription>
                  Easy-to-use NFT minting and management platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">0.8 SOL</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <Button asChild>
                    <Link href="/discover">View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
