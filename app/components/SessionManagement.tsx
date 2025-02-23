"use client";

import React, { useState } from "react";
import { useMatchTracker } from "@/hooks/useMatchTracker";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ClipLoader } from "react-spinners";
import { Transaction } from "@/types/types";
import SessionForm from "./SessionForm";

const sessionSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  courtFee: z.string().min(1, "Court fee is required"),
  players: z.string().optional(),
});

export default function SessionManagement({
  sessions,
  createSession,
  deleteSession,
  onSessionSelect,
  transactions,
}: {
  sessions: any[];
  createSession: (name: string, courtFee: number, players: string[]) => void;
  deleteSession: (sessionId: string) => void;
  onSessionSelect: (sessionId: string) => void;
  transactions: Transaction[];
}) {
  const { userId } = useMatchTracker();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );

  // Initialize react-hook-form
  const form = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      courtFee: "",
      players: "",
    },
  });

  // Handle create session
  const handleSubmit = async (values: any) => {
    if (!userId) return console.error("User ID is required to create a session");

    try {
      setIsLoading(true);
      const playersArray = values.players
        ? values.players
            .split(",")
            .map((p: string) => p.trim())
            .filter(Boolean)
        : [];

      await createSession(values.name, Number.parseFloat(values.courtFee), playersArray);

      form.reset();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete session
  const handleDeleteSession = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this session?");
    if (!confirmed) return;

    try {
      setDeletingSessionId(sessionId);
      await deleteSession(sessionId);
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setDeletingSessionId(null);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter sessions by search
  const filteredSessions = sessions.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
      <CardHeader className="bg-gray-50 rounded-t-xl px-6 py-4 flex items-center justify-between">
        {/* <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
          Sessions
        </CardTitle> */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={isLoading}>
              {isLoading ? (
                <ClipLoader size={16} color="#ffffff" />
              ) : (
                <Plus size={16} />
              )}
              {isLoading ? "Creating..." : "New Session"}
            </Button>
          </DialogTrigger>

          {/* New Session Dialog */}
          <DialogContent className="max-w-lg rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-800">Create New Session</DialogTitle>
            </DialogHeader>

            <SessionForm onSubmit={handleSubmit} isLoading={isLoading} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Search field */}
        <div className="relative max-w-sm w-full mb-4">
          <Input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="text-gray-500 text-center py-6">
            No sessions created yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Court Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow
                  key={session.id}
                  onClick={() => onSessionSelect(session.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>{session.name}</TableCell>
                  <TableCell>
                    {formatDate(session.createdAt.toString())}
                  </TableCell>
                  <TableCell>${session.courtFee}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      disabled={deletingSessionId === session.id}
                    >
                      {deletingSessionId === session.id ? (
                        <ClipLoader size={16} color="red" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
