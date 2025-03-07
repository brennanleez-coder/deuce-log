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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn"); // Remove session flag on logout
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="flex items-center justify-between px-6 md:px-16 py-4 bg-white shadow-sm">
      <Link href="/">
        <h1 className="text-lg md:text-2xl font-bold text-blue-600">
          Deuce Log
        </h1>
      </Link>

      {session?.user ? (
        <div className="relative" ref={dropdownRef}>
          {/* Clickable User Profile */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <span className="text-gray-800 font-light hidden sm:inline">
              {session.user.name ? `Welcome, ${session.user.name}` : "Welcome"}
            </span>
            <Avatar className="h-9 w-9 cursor-pointer">
              {session.user.image ? (
                <AvatarImage
                  src={session.user.image}
                  alt={session.user.name || "user"}
                />
              ) : (
                <AvatarFallback>
                  {session.user.name ? session.user.name.charAt(0) : "?"}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Animated Dropdown Menu (renders below profile) */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50"
              >
                <Link href="https://bustling-ricotta-c3a.notion.site/1aed2a8ea01a80409b92e93ec4136077?pvs=105">
                  <Button
                    className="block w-full text-left text-gray-700 px-4 py-2"
                    variant="ghost"
                  >
                    Report a bug
                  </Button>
                </Link>

                {/* Manage Players Button */}
                <Link href="/manage-players">
                  <Button
                    className="block w-full text-left text-gray-700 px-4 py-2"
                    variant="ghost"
                  >
                    Manage Players
                  </Button>
                </Link>

                <Button
                  onClick={handleLogout}
                  className="block w-full text-left text-gray-700 px-4 py-2"
                  variant="ghost"
                >
                  Logout
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Link href="/auth/login">
          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
            Login
          </Button>
        </Link>
      )}
    </header>
  );
}

export default AuthHeader;
