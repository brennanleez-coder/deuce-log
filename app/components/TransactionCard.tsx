"use client";
import { useState } from "react";
import {
  CheckCircle,
  XCircle,
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
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const { userId, name, editTransaction } = useMatchTracker();
  const [isEditing, setIsEditing] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const handleEdit = async (formData: Partial<Transaction>) => {
    const merged = {
      ...transaction,
      ...formData,
      id: transaction.id,
    };

    await editTransaction({
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

    setIsEditing(false);
  };

  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);
    try {
      await editTransaction({
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
    } catch (error) {
      console.error("Error marking as paid:", error);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Determine the winning team
  const winningTeam =
    transaction.team1[0] === transaction.payer ? "team2" : "team1";

  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-2">
        {/* Transaction Type */}
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <p className="font-semibold text-sm text-gray-800 capitalize">
            {transaction.type.toLowerCase()}
          </p>
        </div>

        {/* Edit Button */}
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
          <p className="text-sm font-semibold text-gray-700">Team 1</p>
          <ul className="mt-1 space-y-0.5">
            {transaction.team1.map((player, index) => (
              <li
                key={`team1-${index}`}
                className={`text-sm ${
                  winningTeam === "team1"
                    ? "text-green-700 font-bold"
                    : "text-gray-600"
                }`}
              >
                {player}
              </li>
            ))}
          </ul>
        </div>

        {/* Team 2 */}
        <div>
          <p className="text-sm font-semibold text-gray-700">Team 2</p>
          <ul className="mt-1 space-y-0.5">
            {transaction.team2.map((player, index) => (
              <li
                key={`team2-${index}`}
                className={`text-sm ${
                  winningTeam === "team2"
                    ? "text-green-700 font-bold"
                    : "text-gray-600"
                }`}
              >
                {player}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between items-center border-t pt-3 mt-3">
        {/* Payment Status & Button Container */}
        <div className="flex items-center justify-center gap-2 w-[130px] h-9">
          {transaction.paid ? (
            // Show the "Paid" text in the same container
            <p className="text-green-700 flex items-center gap-1 text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Paid</span>
            </p>
          ) : (
            // Reserve the same space with the "Mark as Paid" button
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

        {/* Amount Section */}
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
