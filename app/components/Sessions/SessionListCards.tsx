// SessionListCards.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Session = {
  id: string;
  name: string;
  courtFee: number;
  createdAt: string;
};

interface SessionListCardsProps {
  sessions: Session[];
  handleSessionSelect: (sessionId: string) => void;
  handleDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
}

export default function SessionListCards({
  sessions,
  handleSessionSelect,
  handleDeleteSession,
  formatDate,
}: SessionListCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => handleSessionSelect(session.id)}
          className="cursor-pointer"
        >
          <Card className="p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{session.name}</h2>
              {/* Delete button (AlertDialog) */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  className="max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <p className="text-gray-600 px-4">
                    Are you sure you want to delete{" "}
                    <strong>{session.name}</strong>? This action cannot be undone.
                  </p>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <p className="text-gray-600 mb-2">
              <strong>Created:</strong> {formatDate(session.createdAt)}
            </p>
            <p className="text-gray-600">
              <strong>Court Fee:</strong> ${session.courtFee}
            </p>
          </Card>
        </div>
      ))}
    </div>
  );
}
