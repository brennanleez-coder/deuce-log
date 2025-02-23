"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center max-w-3xl mx-auto p-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 text-gray-900">
          Track Your Wins with{" "}
          <span className="text-blue-600">Deuce Log</span>
        </h1>
        <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto mb-8">
          A minimalist tool to record your match outcomes, track head-to-head stats, 
          and gain performance insights—all in one place.
        </p>
        <Link href="/auth/login">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:text-blue-700 hover:bg-gray-50 border border-blue-600 transition-colors duration-200"
          >
            Get Started
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
