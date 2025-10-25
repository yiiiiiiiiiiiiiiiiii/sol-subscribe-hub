"use client";

import Link from "next/link";
import { WalletButton } from "./wallet-button";
import { Layers } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Layers className="h-6 w-6 text-primary" />
            Sol Subscribe Hub
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/discover"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/publish"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Publish
            </Link>
            <Link
              href="/my-subscriptions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Subscriptions
            </Link>
            <Link
              href="/my-services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Services
            </Link>
            <Link
              href="/roadmap"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Roadmap
            </Link>
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
