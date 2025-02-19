"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Track Your Wins with <span className="text-blue-600">Deuce Log</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Track your matches, head-to-head stats, and performance insights
          effortlessly.
        </p>
        <Link href="/auth/login">
          <Button
            size="lg"
            className="bg-white text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            Login to Get Started
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
