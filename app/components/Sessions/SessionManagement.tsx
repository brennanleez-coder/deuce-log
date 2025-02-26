"use client";

import React, { useState } from "react";
import { useUser } from "@/hooks/useUser";
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
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Search, ArrowUpDown } from "lucide-react";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import { Input } from "@/components/ui/input";
import { ClipLoader } from "react-spinners";
import { useDebounce } from "@/hooks/useDebounce";
import SessionForm from "./SessionForm";
import {useRouter} from "next/navigation";
import Loader from "@/components/FullScreenLoader";
const ITEMS_PER_PAGE = 5; // Controls pagination

export default function SessionManagement({}: {
}) {
  const { userId } = useUser();
  const { loading, sessions, createSession, deleteSession } = useBadmintonSessions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const handleSessionSelect = (sessionId: string) => {
      router.push(`/session/${sessionId}`);
    };
  
  // Format date for better readability
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortOrder === "asc") return a.createdAt.localeCompare(b.createdAt);
    return b.createdAt.localeCompare(a.createdAt);
  });

  const filteredSessions = sortedSessions.filter((s) =>
    s.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const paginatedSessions = filteredSessions.slice(
    0,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSubmit = async (values: any) => {
    if (!userId)
      return console.error("User ID is required to create a session");

    try {
      setIsLoading(true);
      const playersArray = values.players
        ? values.players
            .split(",")
            .map((p: string) => p.trim())
            .filter(Boolean)
        : [];

      await createSession(
        values.name,
        Number.parseFloat(values.courtFee),
        playersArray
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevents accidental session click
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
      <CardHeader className="bg-gray-50 rounded-t-xl px-6 py-4 flex items-center justify-between">
        <CardTitle className="flex w-full items-center gap-3 justify-between text-xl font-bold text-gray-800">
          Sessions
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

            <DialogContent className="max-w-lg rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-gray-800">
                  Create New Session
                </DialogTitle>
              </DialogHeader>
              <SessionForm onSubmit={handleSubmit} isLoading={isLoading} />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <Button
            onClick={toggleSortOrder}
            variant="outline"
            className="flex items-center gap-2"
          >
            Sort by Date <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {loading? (
          <div className="flex justify-center py-6">
            <Loader/>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-gray-500 text-center py-6">
            No sessions created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white shadow-sm">
                <TableRow>
                  <TableHead>Session Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Court Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSessions.map((session) => (
                  <TableRow
                    key={session.id}
                    onClick={() => handleSessionSelect(session.id)}
                    className="cursor-pointer hover:bg-gray-100 transition-all duration-200"
                  >
                    <TableCell className="font-medium">
                      {session.name}
                    </TableCell>
                    <TableCell>
                      {formatDate(session.createdAt.toString())}
                    </TableCell>
                    <TableCell>${session.courtFee}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()} // Prevent row click
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                          className="max-w-md"
                          onClick={(e) => e.stopPropagation()} // Prevent row click when interacting with dialog
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <p className="text-gray-600 px-4">
                            Are you sure you want to delete{" "}
                            <strong>{session.name}</strong>? This action cannot
                            be undone.
                          </p>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) =>
                                handleDeleteSession(session.id, e)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Yes, Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
