"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Search, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import TransactionCard from "@/app/components/Transactions/TransactionCard";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import { Transaction } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransactionForm from "@/app/components/Transactions/TransactionForm";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type TransactionsListProps = {
  addTransaction: (transaction: Transaction) => void;
  transactions: Transaction[];
  wins: Transaction[];
  losses: Transaction[];
  winCount: number; // total wins (unfiltered)
  lossCount: number; // total losses (unfiltered)
  totalWinsAmount: number; // total $ for all wins
  totalLossesAmount: number; // total $ for all losses
  // Optionally, if these values are available from parent:
  userId?: string;
  name?: string;
  sessionId?: string;
  shared?: boolean;
};

export default function TransactionsList({
  addTransaction = () => {},
  transactions,
  wins,
  losses,
  winCount,
  lossCount,
  totalWinsAmount,
  totalLossesAmount,
  userId = "defaultUserId", // Placeholder value, pass real value from parent/context
  name = "Default Name", // Placeholder value
  sessionId = "defaultSessionId", // Placeholder value
  sharing = true,
}: TransactionsListProps) {
  // State for Dialog open/close
  const [isOpen, setIsOpen] = useState(false);

  // Default sort => timestamp descending
  const [sortBy, setSortBy] = useState<"timestamp" | "amount" | "">(
    "timestamp"
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [friendlyFilter, setFriendlyFilter] = useState<"all" | "friendly">(
    "all"
  );
  const [layout, setLayout] = useState<"columns" | "swipe">("columns"); // 🆕 Layout toggle

  const friendlyOption = friendlyFilter === "friendly" ? true : undefined;

  const handleSortToggle = (field: "timestamp" | "amount") => {
    if (sortBy === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const handleFriendlyToggle = () => {
    setFriendlyFilter((prev) => (prev === "friendly" ? "all" : "friendly"));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFriendlyFilter("all");
    setSortBy("timestamp");
    setOrder("desc");
  };

  const filteredTransactions = useFilteredTransactions(
    transactions,
    wins,
    losses,
    searchQuery,
    {
      sortBy: sortBy || undefined,
      order,
      friendly: friendlyOption,
    }
  );

  const filteredWinsCount = filteredTransactions.wins.length;
  const filteredLossesCount = filteredTransactions.losses.length;

  const filteredWinsAmount = useMemo(
    () => filteredTransactions.wins.reduce((acc, t) => acc + t.amount, 0),
    [filteredTransactions.wins]
  );
  const filteredLossesAmount = useMemo(
    () => filteredTransactions.losses.reduce((acc, t) => acc + t.amount, 0),
    [filteredTransactions.losses]
  );

  const friendlyButtonLabel =
    friendlyFilter === "friendly" ? "All" : "Friendly Only";

  const winsHeader =
    friendlyFilter === "friendly"
      ? `Wins (${filteredWinsCount}/${winCount})`
      : `Wins (${winCount})`;

  const lossesHeader =
    friendlyFilter === "friendly"
      ? `Losses (${filteredLossesCount}/${lossCount})`
      : `Losses (${lossCount})`;

  const winsAmountLabel =
    friendlyFilter === "friendly"
      ? `$${filteredWinsAmount} / $${totalWinsAmount}`
      : `$${totalWinsAmount}`;

  const lossesAmountLabel =
    friendlyFilter === "friendly"
      ? `$${filteredLossesAmount} / $${totalLossesAmount}`
      : `$${totalLossesAmount}`;

  const handleSubmit = (transaction: Transaction) => {
    addTransaction(transaction);
    setIsOpen(false);
  };

  return (
    <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-lg font-semibold">Matches</h2>
        {!sharing && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Match Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm
                userId={userId}
                name={name}
                sessionId={sessionId}
                onSubmit={handleSubmit}
                isEditing={false}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {transactions.length !== 0 && (
        <>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Input */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:max-w-xs border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter & Sorting Options */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={handleFriendlyToggle}
                className="w-full md:w-auto"
              >
                {friendlyFilter === "friendly"
                  ? "All Matches"
                  : "Friendly Only"}
              </Button>

              {/* Sorting Dropdown (Mobile) */}
              <div className="w-full md:hidden">
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as "timestamp" | "amount")
                  }
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sorting Buttons (Desktop) */}
              <div className="hidden md:flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSortToggle("timestamp")}
                >
                  Timestamp
                  {sortBy === "timestamp" &&
                    (order === "asc" ? (
                      <ArrowUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ArrowDown className="ml-2 h-4 w-4" />
                    ))}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSortToggle("amount")}
                >
                  Amount
                  {sortBy === "amount" &&
                    (order === "asc" ? (
                      <ArrowUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ArrowDown className="ml-2 h-4 w-4" />
                    ))}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full md:w-auto"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Transaction Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wins Column */}
            <div>
              <div className="flex justify-between items-center mb-2 text-green-600">
                <h3 className="text-lg font-semibold">{winsHeader}</h3>
                <h3 className="text-lg font-semibold">{winsAmountLabel}</h3>
              </div>
              {filteredTransactions.wins.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">
                  No wins found.
                </p>
              ) : (
                <ul className="space-y-4">
                  {filteredTransactions.wins.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      sharing={sharing}
                    />
                  ))}
                </ul>
              )}
            </div>

            {/* Losses Column */}
            <div>
              <div className="flex justify-between items-center mb-2 text-red-600">
                <h3 className="text-lg font-semibold">{lossesHeader}</h3>
                <h3 className="text-lg font-semibold">{lossesAmountLabel}</h3>
              </div>
              {filteredTransactions.losses.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">
                  No losses found.
                </p>
              ) : (
                <ul className="space-y-4">
                  {filteredTransactions.losses.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      sharing={sharing}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
