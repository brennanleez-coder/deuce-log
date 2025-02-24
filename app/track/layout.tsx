'use client'
import React, { useState, useEffect, useRef } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import AuthHeader from "@/app/components/AuthHeader";

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthHeader />
      <main>{children}</main>
    </SessionProvider>
  );
}
