"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Meteors } from "@/components/magicui/meteors";
import { Typewriter } from "react-simple-typewriter";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    setIsLoggedIn(userLoggedIn);
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden text-gray-900 px-4">
      <Meteors number={90} angle={215} className="fixed inset-0 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 text-center max-w-3xl mx-auto p-6 flex flex-col items-center gap-y-4"
      >
        <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl md:text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
          Deuce Log
        </span>

        <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 font-medium">
          Badminton Meets Statistics
        </p>

        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-8">
          <Typewriter
            words={[
              "Log your matches.",
              "Track Head-to-Head stats.",
              "Analyze your sessions.",
              "See your best partners.",
              "Identify toughest opponents.",
            ]}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={30}
            deleteSpeed={30}
            delaySpeed={1500}
          />
        </p>

        {isLoggedIn ? (
          <Button
            size="lg"
            onClick={() => router.push("/track")}
            variant="outline"
          >
            Return to Session
          </Button>
        ) : (
          <Link href="/auth/login">
            <Button size="lg">Get Started</Button>
          </Link>
        )}
      </motion.div>
    </div>
  );
}
