'use client';
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
      {/* Header with Fade-In Animation */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        // className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm"
      >
        <AuthHeader />
      </motion.header>

      {/* Main Content with Scale & Slide-Up Animation */}
      <motion.main
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        className=" min-h-screen p-4 md:p-6"
      >
        {children}
      </motion.main>
    </SessionProvider>
  );
}
