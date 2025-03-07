"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Check, X, Users, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import { useUser } from "@/hooks/useUser";
import axios from "axios";

const ManagePlayersPage = () => {
  const router = useRouter();
  const { userId, name } = useUser();
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const { sessions: allSessions, isLoading: sessionsLoading } =
    useBadmintonSessions();

  useEffect(() => {
    if (!userId || sessionsLoading) return;

    // Get all unique players from sessions
    const dedupePlayers = Array.from(
      new Set(allSessions.flatMap((s: any) => s.players || []))
    );
    setPlayers(dedupePlayers.filter(p => p !== name));
  }, [userId, allSessions, sessionsLoading]);

  if (sessionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
      </div>
    );
  }

  const handleRenamePlayer = async (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) return;
    if (players.includes(newName)) {
      toast.warning(`${newName} already exists.`);
      return;
    }

    try {
      setLoading(true);

      // Find all sessions where the player is present
      const sessionsToUpdate = allSessions.filter((session: any) =>
        session.players.includes(oldName)
      );

      if (sessionsToUpdate.length === 0) {
        toast.error(`No sessions found with ${oldName}`);
        return;
      }

      // Send API requests to update all affected sessions and transactions
      await Promise.all(
        sessionsToUpdate.map(async (session: any) => {
          const updatedPlayers = session.players.map((p: string) =>
            p === oldName ? newName : p
          );

          await axios.put(`/api/badminton-sessions`, {
            sessionId: session.id,
            name: session.name,
            courtFee: session.courtFee,
            players: updatedPlayers,
            oldPlayerName: oldName,
            newPlayerName: newName,
          });
        })
      );

      // Optimistic UI update
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) => (p === oldName ? newName : p))
      );

      toast.success(`Player renamed from ${oldName} to ${newName}!`);
      setEditingPlayer(null);
    } catch (error) {
      console.error("Failed to rename player:", error);
      toast.error("Failed to rename player. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center pt-16">
      {/* Container */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Button>

          <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Manage Players
          </h1>
        </div>

        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {/* Players Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-2/3 text-left">Player Name</TableHead>
                <TableHead className="w-1/3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => (
                  <TableRow key={player} className="hover:bg-gray-100">
                    <TableCell>
                      {editingPlayer === player ? (
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            handleRenamePlayer(player, newName)
                          }
                          className="border-gray-300 w-full"
                        />
                      ) : (
                        <span className="truncate block">{player}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingPlayer === player ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={loading}
                            onClick={() => handleRenamePlayer(player, newName)}
                          >
                            {loading ? (
                              <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                            ) : (
                              <Check className="w-5 h-5 text-green-500" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingPlayer(null)}
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingPlayer(player);
                            setNewName(player);
                          }}
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-gray-500 py-4"
                  >
                    No players found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Total Players */}
        <p className="text-gray-600 mt-4 text-sm text-center">
          Total Players: <span className="font-semibold">{players.length}</span>
        </p>
      </div>
    </div>
  );
};

export default ManagePlayersPage;
