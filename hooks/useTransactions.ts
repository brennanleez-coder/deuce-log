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

  const deleteTransaction = useMutation<void, Error, string>({
    mutationFn: async (transactionId: string) => {
      await axios.delete(`/api/transactions?id=${transactionId}`);
    },
    onMutate: async (transactionId: string) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", selectedSession] });
      const previousTransactions = queryClient.getQueryData<Transaction[]>([
        "transactions",
        selectedSession,
      ]);

      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(
          ["transactions", selectedSession],
          previousTransactions.filter((tx) => tx.id !== transactionId)
        );
      }
      return { previousTransactions };
    },
    onError: (error, transactionId, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions", selectedSession],
          context.previousTransactions
        );
      }
      console.error("Error deleting transaction:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", selectedSession] });
    },
  });

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
