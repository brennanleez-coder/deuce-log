"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn");
    signOut({ callbackUrl: "/" });
  };

  const navLinks = [
    { name: "Home", path: "/track" },
    { name: "Stats", path: "/stats" },
    { name: "Discover", path: "/discover-players" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
      <div className="flex items-center justify-between px-4 md:px-16 py-3">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-lg md:text-2xl font-bold text-slate-700 hover:text-slate-900 transition-colors">
            Deuce Log
          </h1>
        </Link>

        <motion.nav key="nav-bar" className="flex space-x-6 relative">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`relative font-medium transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 right-0 -bottom-1 h-[2px] bg-blue-600 rounded-full"
                    transition={{ type: "spring", stiffness: 320, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </motion.nav>

        {/* User Profile Dropdown */}
        {session?.user && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-2 group"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <span className="hidden sm:inline text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                {session.user.name ? `Hi, ${session.user.name}` : "Welcome"}
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
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Animated Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-md shadow-lg py-2 z-50"
                >
                  <Link href="/manage-players">
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-slate-700 hover:bg-slate-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Manage Players
                    </Button>
                  </Link>
                  <Link href="https://bustling-ricotta-c3a.notion.site/1aed2a8ea01a80409b92e93ec4136077?pvs=105">
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-slate-700 hover:bg-slate-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Report a Bug
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start px-4 py-2 text-left text-red-600 hover:bg-red-50"
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
