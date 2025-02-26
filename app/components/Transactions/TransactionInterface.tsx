import { useState, useEffect, useRef } from "react";
import { Search, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Transaction} from "@/types/types";

export default function TransactionInterface({
  user,
  sessionId,
  addTransaction,
  updateTransaction,
  transactions,
}: any) {
  // If no session is selected, bail out.
  if (!sessionId) return null;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"MATCH" | "SIDEBET">("MATCH");
  const [amount, setAmount] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);


  // Auto-scroll to the bottom when new transactions arrive.
  const transactionsEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (transactions.length > 0) {
      transactionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transactions]);

  const openFormForAdd = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };


  return (
    <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
      <CardHeader className="bg-gray-50 rounded-t-xl px-6 py-4">
        <CardTitle className="text-2xl font-bold text-gray-800 mb-1">
          Match Manager
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Quickly log and view your Match and Side Bet transactions.
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <div className="relative w-full">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <Input
                id="search"
                type="text"
                placeholder="Search by player name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>

          <Button onClick={openFormForAdd} className="flex-shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Match
          </Button>
        </div>

        

        {/* Scroll anchor */}
        <div ref={transactionsEndRef} />
      </CardContent>

      {/* Dialog for Add/Edit Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Match" : "Add Match"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? "Update the transaction details below."
                : "Fill out the fields to create a new transaction."}
            </DialogDescription>
          </DialogHeader>

        asd
        </DialogContent>
      </Dialog>
    </Card>
  );
}
