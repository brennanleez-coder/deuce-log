"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
      >
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
          Sign in to <span className="text-blue-600">Deuce Log</span>
        </h2>
        <p className="mt-2 text-base md:text-lg text-gray-700">
          Track your matches and head-to-head stats effortlessly.
        </p>
        <div className="mt-8">
          <Button
            size="lg"
            className="w-full bg-white text-blue-600 hover:text-blue-700 hover:bg-gray-50 border border-blue-600 transition-colors duration-200"
            onClick={() => signIn("google", { callbackUrl: "/track" })}
          >
            Sign in with Google
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
