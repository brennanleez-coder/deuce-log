"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { MatchLayout, SideBetLayout } from "@/app/components/TransactionLayout";

type TransactionCardProps = {
  transaction: any;
  user: string;
  toggleExpanded: (id: string) => void;
  isExpanded: boolean;
  formatCurrency: (amount: number) => string;
  handleEdit: (transaction: any) => void;
  handleMarkPaidToggle: (e: React.MouseEvent, transaction: any) => void;
  bookmakerName: string;
};

export default function TransactionCard({
  transaction,
  user,
  toggleExpanded,
  isExpanded,
  formatCurrency,
  handleEdit,
  handleMarkPaidToggle,
  bookmakerName,
}: TransactionCardProps) {
  // Helper: short text for who owes whom in collapsed view
  const getCollapsedSummary = () => {
    const {
      type,
      players,
      payerIndex,
      receiverIndex,
      amount,
      bettorWon,
      userSide,
    } = transaction;

    if (type === "Match") {
      const payer = players[payerIndex];
      const receiver = players[receiverIndex];

      if (receiver === user) {
        return `${payer} owes you ${formatCurrency(amount)}`;
      }
      if (payer === user) {
        return `You owe ${receiver} ${formatCurrency(amount)}`;
      }
      return `${payer} pays ${receiver} ${formatCurrency(amount)}`;
    } else {
      // SideBet
      // players[4] is the “other side”
      // userSide = "Bettor" or "Bookmaker"
      // bettorWon = bool
      const otherSide = players[4] || "N/A";

      // If user is Bettor
      if (userSide === "Bettor") {
        if (bettorWon) {
          return `${otherSide} owes you ${formatCurrency(amount)}`;
        } else {
          return `You owe ${otherSide} ${formatCurrency(amount)}`;
        }
      } else {
        // userSide = "Bookmaker"
        if (bettorWon) {
          return `You owe ${otherSide} ${formatCurrency(amount)}`;
        } else {
          return `${otherSide} owes you ${formatCurrency(amount)}`;
        }
      }
    }
  };

  return (
    <Card
      key={transaction.id}
      className="border-gray-200 hover:shadow-sm transition group"
    >
      {/* Collapsed row */}
      <div
        onClick={() => toggleExpanded(transaction.id)}
        className="cursor-pointer p-4 flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center"
      >
        {/* Teams */}
        <div className="flex items-center space-x-2 font-semibold text-gray-700">
          <span>
            {transaction.players[0]} &amp; {transaction.players[1]}
          </span>
          <span className="text-sm text-gray-400">VS</span>
          <span>
            {transaction.players[2]} &amp; {transaction.players[3]}
          </span>
        </div>

        {/* Match or SideBet chip + Paid status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-right mt-2 sm:mt-0">
          {/* Who owes who (short summary) */}
          <div className="text-sm text-gray-600 font-normal">
            {getCollapsedSummary()}
          </div>

          <div className="flex flex-wrap gap-1">
            {transaction.type === "Match" ? (
              <span className="shrink-0 whitespace-nowrap inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-800 mt-1 sm:mt-0">
                Match
              </span>
            ) : (
              <span className="shrink-0 whitespace-nowrap inline-flex items-center rounded-full bg-purple-100 px-3 py-0.5 text-xs font-medium text-purple-800 mt-1 sm:mt-0">
                Side Bet vs. {bookmakerName}
              </span>
            )}

            {transaction.paid ? (
              <span className="shrink-0 whitespace-nowrap inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-3 py-0.5 mt-1 sm:mt-0">
                Paid
              </span>
            ) : (
              <span className="shrink-0 whitespace-nowrap inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-3 py-0.5 mt-1 sm:mt-0">
                Unpaid
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <CardContent className="p-4 border-t bg-gray-50">
          {/* Timestamp + Amount */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              {new Date(transaction.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <div className="text-lg font-semibold text-slate-500">
              {formatCurrency(transaction.amount)}
            </div>
          </div>

          {/* Who owes who (detailed) */}
          {transaction.type === "Match" && (
            <div className="mb-2 p-2">
              {transaction.players[transaction.receiverIndex] === user ? (
                <span className="text-sm font-medium text-green-600">
                  {transaction.players[transaction.payerIndex]} owes you{" "}
                  {formatCurrency(transaction.amount)}
                </span>
              ) : transaction.players[transaction.payerIndex] === user ? (
                <span className="text-sm font-medium text-red-600">
                  You owe {transaction.players[transaction.receiverIndex]}{" "}
                  {formatCurrency(transaction.amount)}
                </span>
              ) : (
                <span className="text-sm text-gray-600">
                  {transaction.players[transaction.payerIndex]} pays{" "}
                  {transaction.players[transaction.receiverIndex]}
                </span>
              )}
            </div>
          )}

          {/* Layouts for 2v2 / side bet */}
          {transaction.type === "Match" ? (
            <MatchLayout transaction={transaction} user={user} />
          ) : (
            <SideBetLayout transaction={transaction} user={user} />
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 px-0"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(transaction);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            {transaction.paid ? (
              <>
                <span className="text-sm text-green-600 font-medium">Paid</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleMarkPaidToggle(e, transaction)}
                >
                  Unmark as Paid
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleMarkPaidToggle(e, transaction)}
              >
                Mark as Paid
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
