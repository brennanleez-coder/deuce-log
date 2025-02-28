"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (loading) {
      router.push("/error");
      return;
    }

    setLoading(true);

    try {
      await signIn("google", { callbackUrl: "/track" });
    } catch (error) {
      setLoading(false);
      router.push("/error");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-sm p-6  bg-white rounded-2xl shadow-xl text-center border"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">Deuce log</span>
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          A minimalist tool to gain performance insights—all in one place.
        </p>
        
        <div className="mt-6">
          <Button
            size="lg"
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSignIn}
            disabled={loading}
          >
            <FcGoogle className="text-xl" />
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </div>


        <Link href="/" className="mt-4 block text-sm text-gray-700 hover:underline">
          Return to Home
        </Link>
      </motion.div>
    </main>
  );
}
