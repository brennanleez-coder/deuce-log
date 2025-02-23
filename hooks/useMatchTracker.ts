"use client";
import { useState, useEffect } from "react";
import { Transaction, BadmintonSession } from "@/types/types";
import { signIn, signOut, useSession } from "next-auth/react";
import axios from "axios";

export function useMatchTracker() {
  const { data: session, status } = useSession(); // Fetch user session from NextAuth
  const [userId, setUserId] = useState<string | null>(null);

  const [sessions, setSessions] = useState<BadmintonSession[]>([]);
  const [name, setName] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
      setName(session.user.name ?? null);
    }
  }, [session]);

  useEffect(() => {
    if (!userId) return; // Prevent fetching without a valid userId

    const fetchSessions = async () => {
      try {
        const { data } = await axios.get("/api/badminton-sessions", {
          params: { userId },
        });
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [userId]);

  useEffect(() => {
    if (!selectedSession) return;

    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get("/api/transactions", {
          params: { sessionId: selectedSession },
        });
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [selectedSession]);


  const createSession = async (sessionName: string, courtFee: number, players: string[]) => {
    if (!userId) return console.error("User ID is required to create a session");

    try {
      const { data: newSession } = await axios.post("/api/badminton-sessions", {
        name: sessionName,
        courtFee,
        players,
        userId,
      });
      setSessions((prev) => [...prev, newSession]); // Update state with new session
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const editSession = async ({
    sessionId,
    name,
    courtFee,
    players,
  }: {
    sessionId: string;
    name: string;
    courtFee: number;
    players: string[];
  }) => {
    try {
      const { data: updatedSession } = await axios.put(
        `/api/badminton-sessions/${sessionId}`, // ✅ Ensure correct API path
        {
          name,
          courtFee,
          players,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );

      console.log("Session updated successfully:", updatedSession);
      return updatedSession;
    } catch (error: any) {
      console.error("Error updating session:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to update session");
    }
  };


  const deleteSession = async ({ sessionId }: { sessionId: string }) => {
    try {
      const res = await fetch(`/api/badminton-sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete session");

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setTransactions((prev) => prev.filter((t) => t.sessionId !== sessionId));
    } catch (error) {
      console.error(error);
    }
  };

  // Create a new transaction
  const addTransaction = async ({
    sessionId,
    type,
    amount,
    team1 = [],
    team2 = [],
    payer,
    receiver,
    bettor,
    bookmaker,
    bettorWon,
  }: {
    sessionId: string;
    type: "MATCH" | "SIDEBET";
    amount: number;
    team1?: string[];
    team2?: string[];
    payer?: string;
    receiver?: string;
    bettor?: string;
    bookmaker?: string;
    bettorWon?: boolean;
  }) => {
    if (!userId) return console.error("User ID is required to add a transaction");

    const payload = {
      sessionId,
      userId,
      type,
      amount,
      team1,
      team2,
      payer,
      receiver,
      bettor,
      bookmaker,
      bettorWon,
    };

    console.log("Sending transaction:", payload); // Log before sending

    try {
      const { data: newTransaction } = await axios.post("/api/transactions", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("New transaction created successfully:", newTransaction);
      setTransactions((prev) => [...prev, newTransaction]);
    } catch (error: any) {
      console.error("Error creating transaction:", error.response?.data || error.message);
    }
  };

  const editTransaction = async ({
    transactionId,
    type,
    amount,
    team1,
    team2,
    payer,
    receiver,
    bettor,
    bookmaker,
    bettorWon,
    paid,
    paidBy,
  }: {
    transactionId: string;
    type: "MATCH" | "SIDEBET";
    amount: number;
    team1: string[];
    team2: string[];
    payer?: string;
    receiver?: string;
    bettor?: string;
    bookmaker?: string;
    bettorWon?: boolean;
    paid?: boolean;
    paidBy?: string;
  }) => {
    try {
      if (!transactionId) throw new Error("Transaction ID is required");

      const payload = {
        type,
        amount,
        team1,
        team2,
        payer,
        receiver,
        bettor,
        bookmaker,
        bettorWon,
        paid,
        paidBy,
      };

      console.log("Sending editTransaction API Call:", transactionId, payload); // 🔍 Debugging Log

      const { data: updatedTransaction } = await axios.put(
        `/api/transactions/${transactionId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? updatedTransaction : t))
      );

      console.log("Transaction updated successfully:", updatedTransaction);
      return updatedTransaction;
    } catch (error: any) {
      console.error("Error updating transaction:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to update transaction");
    }
  };


  const fetchTransactionsBySessionId = async (sessionId: string) => {
    if (!sessionId) return console.error("Session ID is required to fetch transactions");

    try {
      const { data } = await axios.get("/api/transactions", {
        params: { sessionId },
      });
      console.log("Transactions fetched:", data);
      return data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };


  return {
    userId,
    name,
    setName,
    sessions,
    createSession,
    editSession,
    deleteSession,
    addTransaction,
    editTransaction,
    transactions, // Return transactions here
    selectedSession,
    fetchTransactionsBySessionId,

  };
}
