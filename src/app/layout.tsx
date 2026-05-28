import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoSpace Admin — Coworking Management Suite",
  description: "Manage members, payments, workspaces, bookings, leads and P&L from one dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
