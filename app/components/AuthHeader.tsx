"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function AuthHeader() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-16 py-4 bg-gradient-to-b from-white to-gray-100 shadow-md">
      <Link href="/">
        <h1 className="text-2xl font-bold text-gray-800">Deuce Log</h1>
      </Link>
      <div className="relative" ref={dropdownRef}>
        <Button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center focus:outline-none"
          variant="outline"
        >
          <div className="flex items-center space-x-2">
            <span className="text-gray-800 font-medium">
              {session?.user?.name ? `Welcome, ${session.user.name}` : "Welcome"}
            </span>
            
          </div>
        </Button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-2">
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block border-none w-full text-left text-gray-700"
              variant="outline"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export default AuthHeader;
