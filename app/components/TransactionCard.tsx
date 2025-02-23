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

  const handleEdit = async (updatedTransaction: Transaction) => {
    await editTransaction(updatedTransaction);
    setIsEditing(false);
  };

  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);
    try {
      await editTransaction({
        ...transaction,
        paid: true,
        paidBy: "", // Mark as paid by current user
      });
    } catch (error) {
      console.error("Error marking as paid:", error);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Determine the winning team
  const winningTeam = transaction.team1[0] === transaction.payer ? "team2" : "team1";

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
                  winningTeam === "team1" ? "text-green-700 font-bold" : "text-gray-600"
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
                  winningTeam === "team2" ? "text-green-700 font-bold" : "text-gray-600"
                }`}
              >
                {player}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Payer → Receiver Sentence */}
      <div className="border-t pt-3 mt-3 flex items-center gap-2 text-sm">
        <p className="text-gray-700">💸</p>
        <span className="text-red-600 font-semibold">{transaction.payer}</span>
        <span className="text-gray-700">pays</span>
        <span className="text-green-600 font-semibold">{transaction.receiver}</span>
      </div>

      {/* Payment Status & Amount */}
      <div className="flex justify-between items-center border-t pt-3 mt-3">
        <div className="flex items-center gap-2">
          {transaction.paid ? (
            <p className="text-green-700 flex items-center gap-1 text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Paid by {transaction.paidBy}</span>
            </p>
          ) : (
            <p className="text-red-700 flex items-center gap-1 text-sm">
              <XCircle className="w-5 h-5" />
              <span>Not Paid</span>
            </p>
          )}
        </div>

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
            {transaction.payer === transaction.team1[0] ? "-" : "+"}${transaction.amount}
          </p>
        </div>
      </div>

      {/* Mark as Paid Button */}
      {!transaction.paid && (
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleMarkAsPaid}
            disabled={isMarkingPaid}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition"
          >
            {isMarkingPaid ? "Marking..." : "Mark as Paid"}
            <Check className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
