'use client';
import React from "react";
import { SessionProvider } from "next-auth/react";
import AuthHeader from "@/app/components/AuthHeader";

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <header className="fixed top-0 left-0 right-0 bg-white z-50">
        <AuthHeader />
      </header>
      <main className="pt-16">
        {children}
      </main>
    </SessionProvider>
  );
}
