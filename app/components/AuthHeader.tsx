"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

function AuthHeader() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 md:px-16 py-4 bg-white shadow-sm">
      <Link href="/">
        <h1 className="text-lg md:text-2xl font-bold text-blue-600">Deuce Log</h1>
      </Link>
      <div className="relative flex items-center space-x-2" ref={dropdownRef}>
        {/* Clickable User Section */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <span className="text-gray-800 font-light hidden sm:inline">
            {session?.user?.name ? `Welcome, ${session.user.name}` : "Welcome"}
          </span>
          <Avatar className="h-8 w-8 cursor-pointer">
            {session?.user?.image ? (
              <AvatarImage src={session.user.image} alt={session.user.name || "user"} />
            ) : (
              <AvatarFallback>
                {session?.user?.name ? session.user.name.charAt(0) : "?"}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        {/* Animated Dropdown */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50"
            >
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left text-gray-700 px-4 py-2"
                variant="ghost"
              >
                Logout
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default AuthHeader;
