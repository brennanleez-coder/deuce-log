// SessionListTable.tsx
import React from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Session = {
  id: string;
  name: string;
  courtFee: number;
  createdAt: string;
};

interface SessionListTableProps {
  sessions: Session[];
  handleSessionSelect: (sessionId: string) => void;
  handleDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
}

export default function SessionListTable({
  sessions,
  handleSessionSelect,
  handleDeleteSession,
  formatDate,
}: SessionListTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white text-sm">
        <thead className="sticky top-0 bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left font-semibold">Session Name</th>
            <th className="py-3 px-4 text-left font-semibold">Created At</th>
            <th className="py-3 px-4 text-left font-semibold">Court Fee</th>
            <th className="py-3 px-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr
              key={session.id}
              onClick={() => handleSessionSelect(session.id)}
              className="cursor-pointer hover:bg-gray-100 transition"
            >
              <td className="py-2 px-4 font-medium">{session.name}</td>
              <td className="py-2 px-4">{formatDate(session.createdAt)}</td>
              <td className="py-2 px-4">${session.courtFee}</td>
              <td className="py-2 px-4 text-right">
                {/* Delete button */}
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
                      <strong>{session.name}</strong>? This action
                      cannot be undone.
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
