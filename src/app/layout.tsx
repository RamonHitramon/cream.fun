import type { Metadata } from "next";
import "./globals.css";
import { PrivyProvider } from '@/components/PrivyProvider';

export const metadata: Metadata = {
  title: 'cream.fun',
  description: 'Hyperliquid basket trading UI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-hl-bg text-white">
        <PrivyProvider>
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
