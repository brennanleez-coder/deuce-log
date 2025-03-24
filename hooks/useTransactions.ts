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

  // 1) Fetch session transactions
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
    enabled: Boolean(selectedSession),
    initialData: [],
  });

  // 2) Add Transaction Mutation
  const addTransaction = useMutation<Transaction, Error, Transaction>({
    mutationFn: async (newTx: Transaction) => {
      const { data } = await axios.post("/api/transactions", newTx);
      return data;
    },
    onMutate: async (newTx) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", selectedSession] });

      const previousTransactions = queryClient.getQueryData<Transaction[]>([
        "transactions",
        selectedSession,
      ]);

      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(
          ["transactions", selectedSession],
          [...previousTransactions, { ...newTx, id: `temp-${Date.now()}` }]
        );
      }

      return { previousTransactions };
    },
    onError: (error, _newTx, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions", selectedSession],
          context.previousTransactions
        );
      }
      console.error("Error creating transaction:", error);
    },
    onSettled: () => {
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
      queryClient.invalidateQueries({ queryKey: ["transactions", selectedSession] });
    },
    onError: (error) => {
      console.error("Error updating transaction:", error);
    },
  });

  // 4) Delete Transaction Mutation
  const deleteTransaction = useMutation<void, Error, string>({
    // Our "variables" here is just the transactionId we want to delete
    mutationFn: async (transactionId: string) => {
      // Calls the DELETE endpoint with `id` as a query param
      await axios.delete(`/api/transactions?id=${transactionId}`);
    },
    onMutate: async (transactionId: string) => {
      // Cancel any outgoing fetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["transactions", selectedSession] });

      // Snapshot previous transactions
      const previousTransactions = queryClient.getQueryData<Transaction[]>([
        "transactions",
        selectedSession,
      ]);

      // Optimistically remove the transaction from the list
      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(
          ["transactions", selectedSession],
          previousTransactions.filter((tx) => tx.id !== transactionId)
        );
      }

      // Return the snapshot so we can roll back in case of error
      return { previousTransactions };
    },
    onError: (error, transactionId, context) => {
      // Roll back to previous state if the mutation fails
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions", selectedSession],
          context.previousTransactions
        );
      }
      console.error("Error deleting transaction:", error);
    },
    onSettled: () => {
      // Refetch after success or error to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["transactions", selectedSession] });
    },
  });

  // 5) (Optional) Fetch Transactions by user ID (manual approach)
  const fetchTransactionsByUserId = useCallback(
    async (uid?: string) => {
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
    },
    [userId, queryClient]
  );

  return {
    transactions,
    isLoading,
    isError,

    addTransaction: addTransaction.mutate,
    editTransaction: editTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,

    fetchTransactionsByUserId, // optional
  };
};
