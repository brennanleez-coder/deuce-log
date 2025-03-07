"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

function AuthHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
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
    localStorage.removeItem("userLoggedIn");
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="flex items-center justify-between px-4 md:px-16 py-4">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-lg md:text-2xl font-bold text-blue-600">
            Deuce Log
          </h1>
        </Link>

        {/* Navigation Links (Desktop & Mobile) */}
        <nav className="flex space-x-6">
          {["/track", "/discover-players"].map((route, index) => (
            <Link
              key={index}
              href={route}
              className={`relative font-medium text-gray-700 hover:text-blue-600 ${
                pathname === route ? "text-blue-600" : ""
              }`}
            >
              {route === "/track" ? "Home" : "Discover"}
              {pathname === route && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 right-0 -bottom-1 h-1 bg-blue-600 rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile Dropdown */}
        {session?.user && (
          <div className="relative" ref={dropdownRef}>
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

            {/* Animated Dropdown Menu */}
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
                    <Button className="block w-full text-left px-4 py-2" variant="ghost">
                      Report a Bug
                    </Button>
                  </Link>

                  <Link href="/manage-players">
                    <Button className="block w-full text-left px-4 py-2" variant="ghost">
                      Manage Players
                    </Button>
                  </Link>

                  <Button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2"
                    variant="ghost"
                  >
                    Logout
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}

export default AuthHeader;
