"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMatchTracker } from "../../hooks/useMatchTracker";
import SessionManagement from "../components/SessionManagement";
import withAuth from "@/hooks/hoc/withAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Transaction } from "@/types/types";
import Link from "next/link";

function Home() {
  const { data: session } = useSession();
  const { userId, sessions, createSession, deleteSession, fetchTransactionsByUserId } = useMatchTracker();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSessionSelect = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  useEffect(() => {
    if (!userId) return;
    const fetchedTransactions = fetchTransactionsByUserId(userId);
    setTransactions(fetchedTransactions);
  }, [sessions]);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Responsive Container */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar: Session Management */}
          <aside className="flex-1">
            <SessionManagement
              sessions={sessions}
              transactions={transactions}
              createSession={createSession}
              deleteSession={deleteSession}
              onSessionSelect={handleSessionSelect}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default withAuth(Home);
