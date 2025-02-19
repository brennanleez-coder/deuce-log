"use client";

import { signOut } from "next-auth/react";
import { useMatchTracker } from "../../hooks/useMatchTracker";
import SessionManagement from "../components/SessionManagement";
import TransactionInterface from "../components/TransactionInterface";
import FinancialSummary from "../components/FinancialSummary";
import SettlementSummary from "../components/SettlementSummary";
import withAuth from "@/hooks/hoc/withAuth"; // adjust the path as needed
import { Button } from "@/components/ui/button"; // adjust the path as needed
function Home() {
  const {
    name,
    setName,
    sessions,
    createSession,
    addTransaction,
    updateTransaction,
    getSessionTransactions,
    calculateNetGain,
    calculateTotalWinnings,
    calculateTotalLosses,
    calculateNetGainTotal,
    calculateSideBetWinnings,
    calculateSideBetLosses,
    selectedSession,
    setSelectedSession,
    calculateTotalCourtFees,
    calculateSettlement,
    deleteSession,
    markTransactionPaid,
    markTransactionUnpaid,
    addPlayerToSession,
  } = useMatchTracker();

  return (
    <main className="min-h-screen bg-white text-gray-900 p-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Deuce Log</h1>
          {/* LOGOUT BUTTON */}
          <Button
            onClick={() =>signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Logout
          </Button>
        </header>

        <SessionManagement
          sessions={sessions}
          name={name}
          setName={setName}
          createSession={createSession}
          calculateNetGain={calculateNetGain}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          deleteSession={deleteSession}
        />

        {selectedSession && (
          <>
            <TransactionInterface
              user={name}
              sessionId={selectedSession}
              sessions={sessions}
              addTransaction={addTransaction}
              updateTransaction={updateTransaction}
              transactions={getSessionTransactions(selectedSession)}
              markTransactionPaid={markTransactionPaid}
              markTransactionUnpaid={markTransactionUnpaid}
              addPlayerToSession={addPlayerToSession}
            />
            {/* 
            <SettlementSummary
              user={name}
              settlements={calculateSettlement(selectedSession)}
            />
            */}
          </>
        )}

        <FinancialSummary
          totalWinnings={calculateTotalWinnings()}
          totalLosses={calculateTotalLosses()}
          netGain={calculateNetGainTotal()}
          sideBetWinnings={calculateSideBetWinnings()}
          sideBetLosses={calculateSideBetLosses()}
          totalCourtFees={calculateTotalCourtFees()}
        />
      </div>
    </main>
  );
}

export default withAuth(Home);
