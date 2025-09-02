import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { PrivyProvider } from '@/components/PrivyProvider';

export const metadata: Metadata = {
  title: "cream.fun",
  description: "Cream.fun - Advanced Trading Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PrivyProvider>
          <WalletProvider>
            <div className="min-h-screen bg-hl-bg">
              {children}
            </div>
          </WalletProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
