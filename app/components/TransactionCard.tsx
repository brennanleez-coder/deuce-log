"use client";
import { useState } from "react";
import {
  CheckCircle,
  Users,
  DollarSign,
  Pencil,
  Check,
} from "lucide-react";
import { Transaction } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TransactionForm from "@/app/components/TransactionForm";
import { useMatchTracker } from "@/hooks/useMatchTracker";

interface TransactionCardProps {
  transaction: Transaction;
  setSessionTransactions: any;
}

export default function TransactionCard({ transaction, setSessionTransactions }: TransactionCardProps) {
  const { userId, name, editTransaction } = useMatchTracker();
  const [isEditing, setIsEditing] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const handleEdit = async (formData: Partial<Transaction>) => {
    const merged = {
      ...transaction,
      ...formData,
      id: transaction.id,
    };

    const updatedTransaction = await editTransaction({
      transactionId: merged.id,
      type: merged.type,
      amount: merged.amount,
      team1: merged.team1,
      team2: merged.team2,
      payer: merged.payer,
      receiver: merged.receiver,
      bettor: merged.bettor,
      bookmaker: merged.bookmaker,
      bettorWon: merged.bettorWon,
      paid: merged.paid,
      paidBy: merged.paidBy,
    });
    setSessionTransactions((prev: Transaction[]) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
    setIsEditing(false);
  };

  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);
    try {
      const updatedTransaction = await editTransaction({
        transactionId: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        team1: transaction.team1,
        team2: transaction.team2,
        payer: transaction.payer,
        receiver: transaction.receiver,
        bettor: transaction.bettor,
        bookmaker: transaction.bookmaker,
        bettorWon: transaction.bettorWon,
        paid: true,
        paidBy: "", // or userId
      });
      setSessionTransactions((prev: Transaction[]) =>
        prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
      );
    } catch (error) {
      console.error("Error marking as paid:", error);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // For each player, decide which color to apply:
  // red if this player is the payer, green if receiver, else gray.
  function getPlayerColorClass(playerName: string) {
    if (playerName === transaction.payer) {
      return "text-red-700 font-bold";
    }
    if (playerName === transaction.receiver) {
      return "text-green-700 font-bold";
    }
    return "text-gray-600";
  }

  // Safely format the timestamp. Adjust according to your data shape (Date vs string).
  // If you stored createdAt as a string, parse it, etc.
  const formattedTimestamp = transaction.timestamp
    ? new Date(transaction.timestamp).toLocaleString()
    : "";

  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-2">
        {/* Left: Type + Timestamp */}
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-sm text-gray-800 capitalize">
              {transaction.type.toLowerCase()}
            </p>
          </div>
          {formattedTimestamp && (
            <p className="text-xs text-gray-500 mt-1">{formattedTimestamp}</p>
          )}
        </div>

        {/* Right: Edit Button */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <button className="text-gray-500 hover:text-gray-700 transition">
              <Pencil className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm
              userId={userId}
              name={name}
              sessionId={transaction.sessionId}
              transaction={transaction}
              onSubmit={handleEdit}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Section */}
      <div className="grid grid-cols-2 gap-6 border-t pt-3">
        {/* Team 1 */}
        <div>
          <ul className="mt-1 space-y-0.5">
            {transaction.team1.map((player, index) => (
              <li
                key={`team1-${index}`}
                className={`text-sm ${getPlayerColorClass(player)}`}
              >
                {player}
              </li>
            ))}
          </ul>
        </div>

        {/* Team 2 */}
        <div>
          <ul className="mt-1 space-y-0.5">
            {transaction.team2.map((player, index) => (
              <li
                key={`team2-${index}`}
                className={`text-sm ${getPlayerColorClass(player)}`}
              >
                {player}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer: Payment + Amount */}
      <div className="flex justify-between items-center border-t pt-3 mt-3">
        {/* Payment Status & Button */}
        <div className="flex items-center justify-center gap-2 w-[130px] h-9">
          {transaction.paid ? (
            <p className="text-green-700 flex items-center gap-1 text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Paid</span>
            </p>
          ) : (
            <Button
              onClick={handleMarkAsPaid}
              disabled={isMarkingPaid}
              variant="outline"
              className="flex items-center gap-2 px-2 py-1 text-sm font-medium
                   border-green-600 text-green-600 hover:bg-green-50
                   transition-colors h-8"
            >
              {isMarkingPaid ? "Marking..." : "Mark as Paid"}
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-700" />
          <p
            className={`text-sm font-semibold ${
              transaction.payer === transaction.team1[0]
                ? "text-red-700"
                : transaction.receiver === transaction.team1[0]
                ? "text-green-700"
                : "text-gray-600"
            }`}
          >
            {transaction.payer === transaction.team1[0] ? "-" : "+"}$
            {transaction.amount}
          </p>
        </div>
      </div>
    </div>
  );
}
