import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Transaction } from "@/types/types";

interface EditTransactionParams {
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
}

// Hook to manage transactions state independently
export const useTransactions = (selectedSession: string | null) => {
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  // Fetch transactions when selectedSession changes
  useEffect(() => {
    if (!selectedSession) return;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/transactions", {
          params: { sessionId: selectedSession },
        });
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [selectedSession]);

  // Optimistically add a transaction
  const addTransaction = useCallback(
    async ({
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

      const tempId = `temp-${Math.random().toString(36).substring(2, 9)}`;
      const optimisticTransaction: Transaction = {
        id: tempId,
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
        timestamp: new Date().toISOString(),
      };

      setTransactions((prev) => [...prev, optimisticTransaction]);

      try {
        const { data: newTransaction } = await axios.post("/api/transactions", optimisticTransaction);
        setTransactions((prev) =>
          prev.map((t) => (t.id === tempId ? newTransaction : t))
        );
      } catch (error) {
        console.error("Error creating transaction:", error);
        setTransactions((prev) => prev.filter((t) => t.id !== tempId)); // Rollback on failure
      }
    },
    [userId]
  );

  // Optimistically edit a transaction
  const editTransaction = useCallback(
    async ({
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
    }: EditTransactionParams) => {
      if (!transactionId) return console.error("Transaction ID is required");

  
      try {
        const { data: updatedTransaction } = await axios.put(
          `/api/transactions/${transactionId}`,
          { type, amount, team1, team2, payer, receiver, bettor, bookmaker, bettorWon, paid, paidBy },
          { headers: { "Content-Type": "application/json" } }
        );
  
        // **Ensure transactions update with the latest response**

        return updatedTransaction
      } catch (error) {
        console.error("Error updating transaction:", error);
      }
    },
    [setTransactions]
  );
  

  // Fetch transactions by user
  const fetchTransactionsByUserId = async (userId: string) => {
    if (!userId) return console.error("User ID is required to fetch transactions");
    try {
      const { data } = await axios.get("/api/transactions", { params: { userId } });
      console.log("Transactions fetched:", data);
      return data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    editTransaction,
    fetchTransactionsByUserId,
  };
};
