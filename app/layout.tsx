import type React from "react";
import type { Metadata } from "next";
import { SolanaProvider } from "@/lib/solana-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sol Subscribe Hub - Decentralized Publish-Subscribe Platform",
  description:
    "Create and discover services with blockchain-powered subscriptions on Solana",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
