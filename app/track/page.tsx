"use client";

import SessionManagement from "../components/Sessions/SessionManagement";
import withAuth from "@/hooks/hoc/withAuth";
import { useState, useEffect, useRef } from "react";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import { useUser } from "@/hooks/useUser";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import CurrentPerformance from "../components/Stats/CurrentPerformance";

function Home() {
  const { name } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { sessions, isLoading, createSession, editSession, deleteSession } =
    useBadmintonSessions();

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

  return (
    <main className="min-h-screen text-gray-900 p-4 font-sans pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col flex-1 gap-y-6">
            {/* Current Performance Card */}
            <CurrentPerformance name={name} sessions={sessions} />

            {/* Live Matches Card (future feature) */}
            <Card className="flex flex-col gap-y-4">
              <CardHeader className="bg-gray-50 rounded-t-xl px-6 py-4 flex items-center justify-between">
                <CardTitle className="flex w-full items-center gap-3 justify-between text-xl font-bold text-slate-600">
                  <h2 className="text-xl font-bold text-slate-600 text-center">
                    Live Matches
                  </h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center text-slate-500">
                Live Matches Coming Soon!
              </CardContent>
            </Card>

            {/* Session Management */}
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
