"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import router
import { useMatchTracker } from "../../hooks/useMatchTracker";
import SessionManagement from "../components/SessionManagement";

import withAuth from "@/hooks/hoc/withAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";

function Home() {
  const {
    name,
    setName,
    sessions,
    createSession,
    deleteSession,
  } = useMatchTracker();

  const router = useRouter(); // Initialize router

  const handleSessionSelect = (sessionId: string) => {
    router.push(`/session/${sessionId}`); // Navigate to session page
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Global Header */}
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Deuce Log</h1>
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-2 py-1 bg-gray-800 text-white rounded"
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
              createSession={createSession}
              deleteSession={deleteSession}
              onSessionSelect={handleSessionSelect} // Pass navigation function
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default withAuth(Home);
