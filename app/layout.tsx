import "@/lib/safeConsole";
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import ClientToaster from "@/app/components/ClientToaster";
import RootClientWrapper from "@/app/components/RootClientWrapper";

// Determine if we are in local/development
const isLocal = process.env.NODE_ENV === "development";

export const metadata: Metadata = {
  title: isLocal ? "DeuceLog (Local)" : "DeuceLog",
  description: "A simple log",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description ?? undefined} />
        <title>{String(metadata.title ?? "")}</title>
        <link rel="icon" href="/deucelog.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <RootClientWrapper>
          {children}
          <ClientToaster />
          <Analytics />
        </RootClientWrapper>
      </body>
    </html>
  );
}
