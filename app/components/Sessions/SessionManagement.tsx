"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Table as TableIcon, Grid, Plus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import Loader from "@/components/FullScreenLoader";
import SessionForm from "@/app/components/Sessions/SessionForm";
import SessionListTable from "@/app/components/Sessions/SessionListTable";
import SessionListCards from "@/app/components/Sessions/SessionListCards";

const ITEMS_PER_PAGE = 5;
type ViewMode = "table" | "cards";

export default function SessionManagement({
  loading,
  sessions,
  createSession,
  deleteSession,
}: {
  loading: boolean;
  sessions: any[];
  createSession: { mutateAsync: Function };
  deleteSession: { mutateAsync: Function };
}) {
  if (!sessions || !createSession || !deleteSession) {
    return null;
  }
  const { userId } = useUser();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Handle local storage for view mode
  useEffect(() => {
    const savedView = localStorage.getItem("sessionViewMode");
    if (savedView === "table" || savedView === "cards") {
      setViewMode(savedView);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sessionViewMode", viewMode);
  }, [viewMode]);

  // Session actions
  const handleSessionSelect = (sessionId: string) =>
    router.push(`/session/${sessionId}`);

  const handleDeleteSession = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await deleteSession.mutateAsync(sessionId);
      toast.success("Session deleted successfully!");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Error deleting session!");
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

  // Sort, filter, paginate
  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortOrder === "asc") return a.createdAt.localeCompare(b.createdAt);
    return b.createdAt.localeCompare(a.createdAt);
  });

  const filteredSessions = sortedSessions.filter((s) =>
    s.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const paginatedSessions = filteredSessions.slice(0, currentPage * ITEMS_PER_PAGE);

  // Toggle asc/desc
  const toggleSortOrder = () =>
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");

  // Create session
  const handleSubmit = async (values: any) => {
    if (!userId) {
      return console.error("User ID is required to create a session");
    }
    try {
      setIsLoading(true);
      const playersArray = values.players
        ? values.players
            .split(",")
            .map((p: string) => p.trim())
            .filter(Boolean)
        : [];

      // Call the mutation's mutateAsync function
      const newSession = await createSession.mutateAsync({
        name: values.name,
        courtFee: parseFloat(values.courtFee),
        players: playersArray,
      });
      setIsModalOpen(false);
      toast.success("Session created successfully!");
      if (newSession?.id) {
        router.push(`/session/${newSession.id}`);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Error creating session!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-xl">
      <CardHeader className="bg-gray-50 rounded-t-xl px-6 py-4 flex items-center justify-between">
        <CardTitle className="flex w-full items-center gap-3 justify-between text-xl font-bold text-gray-800">
          Sessions
          {/* New Session Dialog */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={isLoading}>
                {isLoading ? (
                  <ClipLoader size={16} color="#fff" />
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
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
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

          {/* Sort / View Toggles */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={toggleSortOrder}
              className="flex items-center gap-2"
            >
              Sort by Date <ArrowUpDown className="w-4 h-4" />
            </Button>
            {viewMode === "table" ? (
              <Button
                variant="outline"
                onClick={() => setViewMode("cards")}
                className="flex items-center gap-2"
              >
                <Grid className="w-4 h-4" />
                Card View
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setViewMode("table")}
                className="flex items-center gap-2"
              >
                <TableIcon className="w-4 h-4" />
                Table View
              </Button>
            )}
          </div>
        </div>

        {/* Loading / No Data */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-gray-500 text-center py-6">
            No sessions created yet.
          </div>
        ) : (
          <>
            {/* Render Table or Cards */}
            {viewMode === "table" ? (
              <SessionListTable
                sessions={paginatedSessions}
                handleSessionSelect={handleSessionSelect}
                handleDeleteSession={handleDeleteSession}
                formatDate={formatDate}
              />
            ) : (
              <SessionListCards
                sessions={paginatedSessions}
                handleSessionSelect={handleSessionSelect}
                handleDeleteSession={handleDeleteSession}
                formatDate={formatDate}
              />
            )}

            {/* Load More */}
            {paginatedSessions.length < filteredSessions.length && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
