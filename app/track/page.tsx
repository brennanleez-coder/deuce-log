"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMatchTracker } from "../../hooks/useMatchTracker";
import SessionManagement from "../components/SessionManagement";
import withAuth from "@/hooks/hoc/withAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react"; // we might not need PlusCircle if unused
import { useState,useEffect } from "react";
import { Transaction } from "@/types/types";
function Home() {
  const { userId, sessions, createSession, deleteSession, fetchTransactionsByUserId } = useMatchTracker();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const handleSessionSelect = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };
  
  useEffect(() => {
    if (!userId) return;
    var fetchedTransactions = fetchTransactionsByUserId(userId);
    setTransactions(fetchedTransactions);
    
  }, [sessions]);


  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Global Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Deuce Log</h1>
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-gray-800 text-white hover:bg-gray-900 transition-colors px-3 py-1 rounded-md"
          >
            Logout
          </Button>
        </header>

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
