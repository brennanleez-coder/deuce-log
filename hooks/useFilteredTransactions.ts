import { useMemo } from "react";
import Fuse from "fuse.js";
import { Transaction } from "@prisma/client";

type FilterOptions = {
  sortBy?: "timestamp" | "amount";
  order?: "asc" | "desc";
  /**
   * friendly?: boolean | undefined
   * - undefined => no filtering by friendly
   * - true => friendly matches (t.amount === 0)
   * - false => non-friendly matches (t.amount !== 0)
   */
  friendly?: boolean;
};

export function useFilteredTransactions(
  transactions: Transaction[],
  wins: Transaction[],
  losses: Transaction[],
  searchQuery: string,
  options?: FilterOptions
) {
  return useMemo(() => {
    let filteredWins = wins;
    let filteredLosses = losses;

    // 1. Apply search filtering (if a query is provided)
    if (searchQuery) {
      const fuse = new Fuse(transactions, {
        keys: ["team1", "team2"],
        threshold: 0.0, // exact matches primarily
      });
      const results = fuse.search(searchQuery).map((result) => result.item);
      filteredWins = results.filter((t) => wins.includes(t));
      filteredLosses = results.filter((t) => losses.includes(t));
    }

    // 2. Filter by friendly flag if specified
    //    friendly = undefined => no filter
    //    friendly = true => amount === 0
    //    friendly = false => amount !== 0
    if (options?.friendly === true) {
      filteredWins = filteredWins.filter((t) => t.amount === 0);
      filteredLosses = filteredLosses.filter((t) => t.amount === 0);
    } else if (options?.friendly === false) {
      filteredWins = filteredWins.filter((t) => t.amount !== 0);
      filteredLosses = filteredLosses.filter((t) => t.amount !== 0);
    }

    // 3. Apply sorting if requested
    if (options?.sortBy === "timestamp") {
      filteredWins.sort((a, b) =>
        options.order === "asc"
          ? +new Date(a.timestamp) - +new Date(b.timestamp)
          : +new Date(b.timestamp) - +new Date(a.timestamp)
      );
      filteredLosses.sort((a, b) =>
        options.order === "asc"
          ? +new Date(a.timestamp) - +new Date(b.timestamp)
          : +new Date(b.timestamp) - +new Date(a.timestamp)
      );
    } else if (options?.sortBy === "amount") {
      filteredWins.sort((a, b) =>
        options.order === "asc" ? a.amount - b.amount : b.amount - a.amount
      );
      filteredLosses.sort((a, b) =>
        options.order === "asc" ? a.amount - b.amount : b.amount - a.amount
      );
    }

    return { wins: filteredWins, losses: filteredLosses };
  }, [searchQuery, transactions, wins, losses, options]);
}
