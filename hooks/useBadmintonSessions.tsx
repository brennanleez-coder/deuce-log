import { useSession } from "next-auth/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadmintonSession } from "@prisma/client";
import { useUser } from "./useUser";

export function useBadmintonSessions() {
  const {userId} = useUser()
  const queryClient = useQueryClient();
  

  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useQuery<BadmintonSession[]>({
    queryKey: ["sessions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await axios.get<BadmintonSession[]>("/api/badminton-sessions", {
        params: { userId },
      });
      return data;
    },
    enabled: !!userId, // only fetch if userId is available
  });

  // ---- CREATE SESSION (optimistic) ----
  const createSession = useMutation<
    BadmintonSession,               // Return type on success
    unknown,                        // Error type
    { name: string; courtFee: number; players: string[] } // Variables
  >({
    mutationFn: async ({ name, courtFee, players }) => {
      const { data } = await axios.post<BadmintonSession>("/api/badminton-sessions", {
        name,
        courtFee,
        players,
        userId,
      });
      return data;
    },
    onMutate: async (newSession) => {
      await queryClient.cancelQueries(["sessions", userId]);
      const previousSessions =
        queryClient.getQueryData<BadmintonSession[]>(["sessions", userId]) || [];
      const tempId = `temp-${Math.random().toString(36).slice(2, 9)}`;
      const optimisticSession: BadmintonSession = {
        id: tempId,
        name: newSession.name,
        courtFee: newSession.courtFee,
        players: newSession.players,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<BadmintonSession[]>(
        ["sessions", userId],
        (old = []) => [...old, optimisticSession]
      );

      return { previousSessions };
    },
    onError: (err, newSession, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(["sessions", userId], context.previousSessions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["sessions", userId]);
    },
  });

  // ---- EDIT SESSION (optimistic) ----
  const editSession = useMutation<
    BadmintonSession,  // Return type on success
    unknown,           // Error type
    { sessionId: string; name: string; courtFee: number; players: string[] } // Variables
  >({
    mutationFn: async ({ sessionId, name, courtFee, players }) => {
      const { data } = await axios.put<BadmintonSession>(
        `/api/badminton-sessions/${sessionId}`,
        { name, courtFee, players }
      );
      return data;
    },
    onMutate: async (updatedInfo) => {
      await queryClient.cancelQueries(["sessions", userId]);
      const previousSessions =
        queryClient.getQueryData<BadmintonSession[]>(["sessions", userId]) || [];

      queryClient.setQueryData<BadmintonSession[]>(
        ["sessions", userId],
        (old = []) =>
          old.map((s) =>
            s.id === updatedInfo.sessionId
              ? { ...s, name: updatedInfo.name, courtFee: updatedInfo.courtFee, players: updatedInfo.players }
              : s
          )
      );

      return { previousSessions };
    },
    onError: (err, updatedInfo, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(["sessions", userId], context.previousSessions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["sessions", userId]);
    },
  });

  // ---- DELETE SESSION (optimistic) ----
  const deleteSession = useMutation<
    string,   // Return type on success (sessionId)
    unknown,  // Error type
    string    // Variable: sessionId to delete
  >({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/badminton-sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete session");
      }
      return sessionId;
    },
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries(["sessions", userId]);
      const previousSessions =
        queryClient.getQueryData<BadmintonSession[]>(["sessions", userId]) || [];
      queryClient.setQueryData<BadmintonSession[]>(
        ["sessions", userId],
        (old = []) => old.filter((s) => s.id !== sessionId)
      );
      return { previousSessions };
    },
    onError: (err, sessionId, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(["sessions", userId], context.previousSessions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["sessions", userId]);
    },
  });

  return {
    sessions,
    isLoading,
    isError,
    error,
    createSession,
    editSession,
    deleteSession,
  };
}
