"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    setIsLoggedIn(userLoggedIn);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-900 px-4">
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
        
        {isLoggedIn ? (
          <Button
            size="lg"
            onClick={() => router.push("/track")}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            Return to Session
          </Button>
        ) : (
          <Link href="/auth/login">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:text-blue-700 hover:bg-gray-50 border border-blue-600 transition-colors duration-200"
            >
              Get Started
            </Button>
          </Link>
        )}
      </motion.div>
    </div>
  );
}
