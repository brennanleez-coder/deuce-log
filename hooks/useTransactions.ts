"use client";

import { useCallback } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { Transaction } from "@prisma/client";

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

export const useTransactions = (selectedSession: string | null = null) => {
  const { userId } = useUser();
  const queryClient = useQueryClient();

  // 1) Fetch session transactions (if `selectedSession` is provided)
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useQuery<Transaction[], Error>({
    queryKey: ["transactions", selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      const { data } = await axios.get("/api/transactions", {
        params: { sessionId: selectedSession },
      });
      return data;
    },
    enabled: Boolean(selectedSession), // only fetch if we have a session
    initialData: [],
  });

  // 2) Add Transaction Mutation
  const addTransaction = useMutation<Transaction, Error, Transaction>({
    mutationFn: async (newTx: Transaction) => {
      // POST to create a new transaction
      const { data } = await axios.post("/api/transactions", newTx);
      return data;
    },
    // Optional: optimistic update
    onMutate: async (newTx) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions", selectedSession] });

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData<Transaction[]>([
        "transactions",
        selectedSession,
      ]);

      // Optimistically update
      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(
          ["transactions", selectedSession],
          [...previousTransactions, { ...newTx, id: `temp-${Date.now()}` }]
        );
      }

      return { previousTransactions };
    },
    onError: (error, _newTx, context) => {
      // Roll back on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions", selectedSession],
          context.previousTransactions
        );
      }
      console.error("Error creating transaction:", error);
    },
    onSettled: () => {
      // Always refetch after success or error
      queryClient.invalidateQueries({ queryKey: ["transactions", selectedSession] });
    },
  });

  // 3) Edit Transaction Mutation
  const editTransaction = useMutation<Transaction, Error, EditTransactionParams>({
    mutationFn: async ({ transactionId, ...rest }) => {
      const { data } = await axios.put(`/api/transactions/${transactionId}`, rest);
      return data;
    },
    onSuccess: () => {
      // Invalidate to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["transactions", selectedSession] });
    },
    onError: (error) => {
      console.error("Error updating transaction:", error);
    },
  });

  // 4) (Optional) Fetch Transactions by user ID (manual approach)
  // If you want a query-based approach, create a separate useQuery. This is a fallback example.
  const fetchTransactionsByUserId = useCallback(async (uid?: string) => {
    const effectiveUserId = uid || userId;
    if (!effectiveUserId) {
      console.error("User ID is required to fetch transactions by user");
      return [];
    }
    try {
      const { data } = await axios.get("/api/transactions", {
        params: { userId: effectiveUserId },
      });
      return data;
    } catch (error) {
      console.error("Error fetching transactions by user:", error);
      return [];
    }
  }, [userId, queryClient]);

  return {
    transactions,
    isLoading,
    isError,

    addTransaction: addTransaction.mutate,

    editTransaction: editTransaction.mutate,

    fetchTransactionsByUserId, // optional
  };
};
