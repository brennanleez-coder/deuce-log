import TransactionCard from "./TransactionCard";
import { Transaction } from "@/types/types";
type TransactionListProps = {
    title: string;
    transactions: Transaction[];
    totalAmount: number;
    expandedTransactionId: string | null;
    toggleExpanded: (transactionId: string) => void;
    user: any;
    formatCurrency: (amount: number) => string;
    handleEdit: (transaction: Transaction) => void;
    handleMarkPaidToggle: (e: any, transaction: Transaction) => void;
    badgeColor: string;
  };

const TransactionList = ({
    title,
    transactions,
    totalAmount,
    expandedTransactionId,
    toggleExpanded,
    user,
    formatCurrency,
    handleEdit,
    handleMarkPaidToggle,
    badgeColor,
  }: TransactionListProps) => {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {title} ({transactions.length})
          </h3>
          <span className={`inline-flex items-center rounded-full ${badgeColor} px-3 py-1 text-xs font-medium`}>
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const isExpanded = expandedTransactionId === transaction.id;
            const bookmakerName = transaction.type === "SideBet" ? transaction.players[4] ?? "N/A" : "";
  
            return (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                isExpanded={isExpanded}
                toggleExpanded={toggleExpanded}
                user={user}
                formatCurrency={formatCurrency}
                handleEdit={handleEdit}
                handleMarkPaidToggle={handleMarkPaidToggle}
                bookmakerName={bookmakerName}
              />
            );
          })}
        </div>
      </div>
    );
  };
  
  export default TransactionList;
  