"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SessionManagement from "../components/Sessions/SessionManagement";
import withAuth from "@/hooks/hoc/withAuth";
import { useState, useEffect, useRef } from "react";
import { Transaction } from "@/types/types";
import AllTimeStats from "@/app/components/Stats/AllTimeStats";
function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside of it
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
  }, [dropdownRef]);

  return (
    <main className="min-h-screen text-gray-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col flex-1 gap-y-6">
            <AllTimeStats userName={session?.user?.name} />

            <SessionManagement />
          </div>
        </div>
      </div>
    </main>
  );
}

export default withAuth(Home);
