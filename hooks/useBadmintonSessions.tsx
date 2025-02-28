import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Transaction, BadmintonSession } from "@/types/types";

// Hook to manage sessions state independently
export const useBadmintonSessions = () => {
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<BadmintonSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (!userId) return;
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/badminton-sessions", {
          params: { userId },
        });
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [userId]);

  const createSession = useCallback(
    async (sessionName: string, courtFee: number, players: string[]) => {
      if (!userId) return console.error("User ID is required");

      // Generate a temporary session object with a fake ID
      const tempId = `temp-${Math.random().toString(36).substring(2, 9)}`;
      const optimisticSession: BadmintonSession = {
        id: tempId,
        name: sessionName,
        createdAt: new Date().toISOString(), // Set temporary timestamp
        courtFee,
        players,
      };

      // Optimistically update state
      setSessions((prev) => [...prev, optimisticSession]);

      try {
        const { data: newSession } = await axios.post("/api/badminton-sessions", {
          name: sessionName,
          courtFee,
          players,
          userId,
        });

        // Replace temporary session with the real one from the API
        setSessions((prev) =>
          prev.map((s) => (s.id === tempId ? newSession : s))
        );
        return newSession;
      } catch (error) {
        console.error("Error creating session:", error);
        // Rollback state if request fails
        setSessions((prev) => prev.filter((s) => s.id !== tempId));
      }
    },
    [userId]
  );

  const editSession = useCallback(
    async ({sessionId, name, courtFee, players}:{
      sessionId: string;
      name: string;
      courtFee: number;
      players: string[];
    }) => {
      const prevSessions = [...sessions];

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, name, courtFee, players } : s
        )
      );

      try {
        const { data: updatedSession } = await axios.put(
          `/api/badminton-sessions/${sessionId}`,
          { name, courtFee, players },
          { headers: { "Content-Type": "application/json" } }
        );

        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? updatedSession : s))
        );
      } catch (error) {
        console.error("Error updating session:", error);
        setSessions(prevSessions); // Revert state on error
      }
    },
    [sessions]
  );


  const deleteSession = useCallback(
    async (sessionId: string) => {
      const prevSessions = [...sessions];
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      try {
        const res = await fetch(`/api/badminton-sessions/${sessionId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete session");
      } catch (error) {
        console.error("Error deleting session:", error);
        setSessions(prevSessions); // Rollback state on error
      }
    },
    [sessions]
  );


  return { sessions, createSession, editSession, deleteSession, loading };
};
