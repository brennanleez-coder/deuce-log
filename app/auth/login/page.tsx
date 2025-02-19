"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-lg bg-white/60 p-8 text-center shadow-lg backdrop-blur-md"
      >
        <h2 className="text-3xl font-bold text-blue-900">Sign in to Deuce Log</h2>
        <p className="mt-2 text-lg text-gray-700">Track your matches and head-to-head stats effortlessly.</p>
        <div className="mt-8 space-y-4">
          <Button
            size="lg"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
            onClick={() => signIn("google", { callbackUrl: "/track" })}
          >
            Sign in with Google
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
