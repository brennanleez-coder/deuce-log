"use client"
import { useMatchTracker } from "../hooks/useMatchTracker"
import SessionManagement from "./components/SessionManagement"
import TransactionInterface from "./components/TransactionInterface"
import FinancialSummary from "./components/FinancialSummary"
import SettlementSummary from "./components/SettlementSummary"

export default function Home() {
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
  } = useMatchTracker()

  return (
    <main className="min-h-screen bg-white text-gray-900 p-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Deuce Log</h1>
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
              addTransaction={addTransaction}
              updateTransaction={updateTransaction}
              transactions={getSessionTransactions(selectedSession)}
            />
            {/* <SettlementSummary user={name} settlements={calculateSettlement(selectedSession)} /> */}
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
  )
}

