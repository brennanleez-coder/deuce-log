"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Edit } from "lucide-react";

import { MatchLayout, SideBetLayout } from "@/app/components/TransactionLayout";

type TransactionCardProps = {
  transaction: any;
  user: any;
  toggleExpanded: any;
  isExpanded: boolean;
  formatCurrency: any;
  handleEdit: any;
  handleMarkPaidToggle: any;
  bookmakerName: string;
};

const TransactionCard = ({
  transaction,
  user,
  toggleExpanded,
  isExpanded,
  formatCurrency,
  handleEdit,
  handleMarkPaidToggle,
  bookmakerName,
}: TransactionCardProps) => {
  return (
    <Card
      key={transaction.id}
      className="border-gray-200 hover:shadow-sm transition group"
    >
      {/* Collapsed row */}
      <div
        onClick={() => toggleExpanded(transaction.id)}
        className="cursor-pointer p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
      >
        <div className="flex items-center space-x-2 font-semibold text-gray-700">
          <span>
            {transaction.players[0]} &amp; {transaction.players[1]}
          </span>
          <span className="text-sm text-gray-400">VS</span>
          <span>
            {transaction.players[2]} &amp; {transaction.players[3]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Match or Side Bet chip */}
          {transaction.type === "Match" ? (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              Match
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
              Side Bet vs. {bookmakerName}
            </span>
          )}
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
            <div className="text-lg font-semibold text-green-700">
              {formatCurrency(transaction.amount)}
            </div>
          </div>

          {/* Who owes who */}
          {transaction.type === "Match" && (
            <div className="mb-2 p-2 ">
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

          {/* 2v2 Layout */}
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
};

export default TransactionCard;
