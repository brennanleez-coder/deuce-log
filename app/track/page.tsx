"use client";

import { useSession } from "next-auth/react";
import SessionManagement from "../components/Sessions/SessionManagement";
import withAuth from "@/hooks/hoc/withAuth";
import { useState, useEffect, useRef } from "react";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import { useUser } from "@/hooks/useUser";
import { Card, CardTitle, CardContent } from "@/components/ui/card";

function Home() {
  const { name } = useUser();
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
            <Card className="flex flex-col gap-y-4 p-4 ">
              <CardTitle>
                <h2 className="text-xl font-bold text-slate-600 text-center">Live Matches</h2>
              </CardTitle>
              <CardContent className="flex items-center justify-center text-slate-500">
                Live Matches Coming Soon!
              </CardContent>
            </Card>

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
