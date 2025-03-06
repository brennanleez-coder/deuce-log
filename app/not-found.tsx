"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center max-w-3xl mx-auto p-6"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-6xl md:text-7xl font-extrabold tracking-tight mb-5 text-blue-600"
        >
          404
        </motion.h1>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <Link href="/">
          <Button
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            Return Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
