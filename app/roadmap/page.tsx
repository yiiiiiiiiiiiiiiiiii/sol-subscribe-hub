import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Project Roadmap</h1>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stylist Token Launch</CardTitle>
                <CardDescription>
                  Token issuance and feature planning for the project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Upcoming launch of Stylist Token, which will maintain a 1:1
                  exchange rate with USD-pegged stablecoins.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">
                    Supported Exchange Currencies:
                  </h4>
                  <ul className="list-disc list-inside ml-4">
                    <li>USDT (Tether)</li>
                    <li>USDC (USD Coin)</li>
                    <li>Other USD-pegged stablecoins</li>
                  </ul>
                </div>
                <div className="space-y-2 mt-4">
                  <h4 className="font-semibold">Core Features:</h4>
                  <ul className="list-disc list-inside ml-4">
                    <li>
                      1:1 Exchange - Seamless exchange with USD-pegged
                      stablecoins
                    </li>
                    <li>
                      Withdrawal Feature - Users can withdraw tokens to other
                      wallets at any time
                    </li>
                    <li>
                      Payment Settlement - All payments in the subscription
                      center will be settled using this token
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
