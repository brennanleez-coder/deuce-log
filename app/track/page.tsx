"use client";

import { useSession } from "next-auth/react";
import SessionManagement from "../components/Sessions/SessionManagement";
import withAuth from "@/hooks/hoc/withAuth";
import { useState, useEffect, useRef } from "react";
import AllTimeStats from "@/app/components/Stats/AllTimeStats";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import { useUser } from "@/hooks/useUser";

function Home() {
  const {name} = useUser()
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
  const { sessions, isLoading, createSession, editSession, deleteSession } =
    useBadmintonSessions();
  const aggregateSessionFees = sessions.reduce(
    (acc, session) => acc + session.courtFee,
    0
  );
  console.log(sessions);
  return (
    <main className="min-h-screen text-gray-900 p-4 font-sans pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col flex-1 gap-y-6">
            {sessions && (
              <AllTimeStats
                userName={name}
                totalSessionFees={aggregateSessionFees}
                transactions={sessions.flatMap((s) => s.transactions ?? [])}
                loading={isLoading}
                showGraphs={false}
              />
            )}

            <SessionManagement
              loading={isLoading}
              sessions={sessions}
              createSession={createSession}
              deleteSession={deleteSession}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default withAuth(Home);
