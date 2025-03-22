"use client";

import React, { useState, useMemo } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  isSameMonth,
  addMonths,
} from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useAllBadmintonSessionStats } from "@/hooks/useAllBadmintonSessionStats";
import { BadmintonSession } from "@prisma/client";

type Session = {
  id: string;
  name: string;
  courtFee: number;
  createdAt: string; // e.g. "2025-03-21T18:49:53.080Z"
};
interface CalendarViewWithDialogProps {
  sessions: BadmintonSession[];
  handleDeleteSession?: (sessionId: string) => void;
}
export default function CalendarViewWithDialog({
  sessions,
  handleDeleteSession,
}: CalendarViewWithDialogProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const sessionStats = useAllBadmintonSessionStats(sessions.flatMap(s => s.transactions), name);

  // Move to previous/next month
  function goToPreviousMonth() {
    setCurrentMonth((prev) => addMonths(prev, -1));
  }
  function goToNextMonth() {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }

  // Compute the displayed range for the calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate the array of days to render
  const daysInCalendar = useMemo(() => {
    const days: Date[] = [];
    let d = calendarStart;
    while (d <= calendarEnd) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  // Group sessions by date
  const sessionsByDay = useMemo(() => {
    const map: Record<string, BadmintonSession[]> = {};
    sessions.forEach((sess) => {
      const dateKey = format(parseISO(sess.createdAt), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(sess);
    });
    return map;
  }, [sessions]);

  function handleSessionClick(session: Session) {
    setSelectedSession(session);
    setIsDialogOpen(true);
  }

  const renderDialogContent = () => {
    if (!selectedSession) return null;
    const stats = sessionStats[selectedSession.id] || {
      matchesPlayed: 0,
      netAmount: 0,
      winCount: 0,
      lossCount: 0,
    };

    const dateStr = format(parseISO(selectedSession.createdAt), "PPpp");
    const totalMatches = stats.matchesPlayed;
    const winRate =
      totalMatches > 0
        ? ((stats.winCount / totalMatches) * 100).toFixed(1) + "%"
        : "N/A";

    return (
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Session Name:</span> {selectedSession.name}
        </p>
        <p>
          <span className="font-medium">Created At:</span> {dateStr}
        </p>
        <p>
          <span className="font-medium">Court Fee:</span> $
          {selectedSession.courtFee.toFixed(2)}
        </p>
        <p>
          <span className="font-medium">Total Matches:</span> {totalMatches}
        </p>
        <p>
          <span className="font-medium">Win Rate:</span> {winRate}
        </p>
        <p>
          <span className="font-medium">Net Earnings:</span>{" "}
          <span
            className={
              stats.netAmount >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
            }
          >
            ${stats.netAmount.toFixed(2)}
          </span>
        </p>
      </div>
    );
  };

  return (
    <div className="hidden sm:block">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" onClick={goToPreviousMonth}>
          &larr; Prev
        </Button>
        <h2 className="text-lg font-semibold text-gray-700">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button variant="outline" onClick={goToNextMonth}>
          Next &rarr;
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
          <div
            key={dayName}
            className="text-center font-medium text-gray-600 border-b pb-1"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2 mt-2">
        {daysInCalendar.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const daySessions = sessionsByDay[dayKey] || [];
          const isInCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={dayKey}
              className={`border min-h-[80px] p-2 rounded-md ${
                isInCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {format(day, "d")}
              </div>

              {daySessions.map((sess) => (
                <p
                  key={sess.id}
                  className="text-xs text-blue-600 truncate cursor-pointer hover:underline"
                  onClick={() => handleSessionClick(sess)}
                >
                  {sess.name}
                </p>
              ))}
            </div>
          );
        })}
      </div>

      {/* Dialog - Show full session details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSession?.name || "Session Details"}</DialogTitle>
            <DialogDescription>{renderDialogContent()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {/* If you want to replicate the "Delete" action: */}
            {selectedSession && handleDeleteSession && (
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={() => {
                  handleDeleteSession(selectedSession.id);
                  setIsDialogOpen(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
