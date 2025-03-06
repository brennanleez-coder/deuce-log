"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import AuthHeader from "@/app/components/AuthHeader";
import { motion } from "framer-motion";

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {/* Auth Header Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <AuthHeader />
      </motion.div>

      {/* Page Content Animation */}
      <motion.main
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        className="min-h-screen p-4 md:p-6"
      >
        {children}
      </motion.main>
    </SessionProvider>
  );
}
