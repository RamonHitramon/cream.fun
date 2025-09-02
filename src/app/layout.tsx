import type { Metadata } from "next";
import "./globals.css";

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
        <div className="min-h-screen bg-hl-bg">
          {children}
        </div>
      </body>
    </html>
  );
}
