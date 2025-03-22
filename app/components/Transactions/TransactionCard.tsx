"use client";
import { useState } from "react";
import { CheckCircle, Users, DollarSign, Pencil, Check } from "lucide-react";
import { Transaction } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TransactionForm from "@/app/components/Transactions/TransactionForm";
import { useUser } from "@/hooks/useUser";
import { useTransactions } from "@/hooks/useTransactions";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface TransactionCardProps {
  transaction: Transaction;
  sharing: boolean;
}

export default function TransactionCard({ transaction, sharing = false}: TransactionCardProps) {
  if (!transaction) return null;

  const { userId, name } = useUser();
  const { editTransaction } = useTransactions(transaction.sessionId);
  const [isEditing, setIsEditing] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction>(transaction);

  const handleEdit = async (formData: Partial<Transaction>) => {
    setIsEditing(false);
    const updatedTransaction = { ...currentTransaction, ...formData };

    // **Optimistically update transaction**
    setCurrentTransaction(updatedTransaction);

    try {
      await editTransaction({
        transactionId: currentTransaction.id,
        ...formData,
      });
      toast.success(`Match against ${updatedTransaction.team2[0] || ""}, ${updatedTransaction.team2[1] || ""} updated!`);
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Error updating match. Please try again.");
      // **Rollback on failure**
      setCurrentTransaction(transaction);
    }
  };

  const handleTogglePaid = async () => {
    if (!currentTransaction) return;
    // setIsMarkingPaid(true);

    // **Optimistic Update**
    const previousTransaction = { ...currentTransaction };
    const updatedTransaction = {
      ...currentTransaction,
      paid: !currentTransaction.paid,
      paidBy: !currentTransaction.paid ? userId : null,
    };
    setCurrentTransaction(updatedTransaction);

    try {
      const reconciliatedUpdatedTransaction = await editTransaction({
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
        // Toggle the paid status
        paid: updatedTransaction.paid,
        paidBy: updatedTransaction.paid ? userId : null, // assign userId when marking as paid, remove when marking unpaid
      });

      // **Ensure UI reflects API response**
      setCurrentTransaction(reconciliatedUpdatedTransaction);
    } catch (error) {
      console.error("Error toggling paid status:", error);
      // **Rollback UI on failure**
      setCurrentTransaction(previousTransaction);
    } finally {
      // setIsMarkingPaid(false);
    }
  };

  function getPlayerColorClass(playerName: string) {
    if (playerName === currentTransaction.payer) {
      return "text-red-700 font-bold";
    }
    if (playerName === currentTransaction.receiver) {
      return "text-green-700 font-bold";
    }
    return "text-gray-600";
  }

  const formattedTimestamp = currentTransaction?.timestamp
    ? formatDistanceToNow(new Date(currentTransaction.timestamp), {
        addSuffix: true,
      })
    : "";

  return (
    <div
      className={`shadow-md rounded-lg p-4 border hover:shadow-lg transition ${
        currentTransaction?.paid
          ? "bg-green-50 border-green-500"
          : "bg-white border-gray-300"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-sm text-gray-800 capitalize">
              {currentTransaction?.type.toLowerCase()}
            </p>
          </div>
          {formattedTimestamp && (
            <p className="text-xs text-gray-500 mt-1">{formattedTimestamp}</p>
          )}
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
              sessionId={currentTransaction?.sessionId}
              transaction={currentTransaction}
              onSubmit={handleEdit}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 items-center justify-center gap-6 border-t pt-3 text-center">
        {/* Team 1 */}
        <div>
          <ul className="space-y-0.5">
            {currentTransaction?.team1.map((player, index) => (
              <li
                key={`team1-${index}`}
                className={`text-sm ${getPlayerColorClass(player)}`}
              >
                {player}
              </li>
            ))}
          </ul>
        </div>

        {/* VS Column */}
        <div className="text-lg font-semibold text-gray-700">VS</div>

        {/* Team 2 */}
        <div>
          <ul className="space-y-0.5">
            {currentTransaction?.team2.map((player, index) => (
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

      <div className="flex justify-between items-center border-t pt-3 mt-3">
        {!sharing && (<div className="flex items-center justify-center gap-2 w-[150px] h-9">
          <Button
            onClick={handleTogglePaid}
            disabled={isMarkingPaid}
            variant="ghost"
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out h-9
    ${
      currentTransaction?.paid
        ? "bg-green-100 text-green-700 border-green-500 hover:bg-green-200"
        : "bg-gray-100 text-gray-700 border-gray-400 hover:bg-gray-200"
    }`}
          >
            {isMarkingPaid ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Updating...</span>
              </>
            ) : currentTransaction?.paid ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Paid</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-gray-600" />
                <span>Mark as Paid</span>
              </>
            )}
          </Button>
        </div>)}

        {/* Amount */}
        <div className="flex items-center gap-2">
          {currentTransaction?.amount === 0 ? (
            <p className="text-sm font-semibold p-2 rounded-full tracking-wide">
              🎉 Friendly Match
            </p>
          ) : (
            <>
              <DollarSign className="w-5 h-5 text-gray-700" />
              <p
                className={`text-sm font-semibold ${
                  currentTransaction?.paid ? "text-green-700" : "text-gray-700"
                }`}
              >
                {currentTransaction?.payer === currentTransaction?.team1[0]
                  ? "-"
                  : "+"}
                ${currentTransaction?.amount}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
