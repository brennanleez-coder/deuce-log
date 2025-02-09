import { useState, useEffect } from "react"

export interface Transaction {
  id: string
  sessionId: string
  type: "Match" | "SideBet"
  amount: number
  players: string[]
  payerIndex: number
  receiverIndex: number
  timestamp: number
  bettorWon?: boolean
  userSide?: "Bettor" | "Bookmaker"
}

export interface Session {
  id: string
  name: string
  createdAt: number
  courtFee: number
}

interface PlayerBalance {
  name: string
  balance: number
}

interface Settlement {
  from: string
  to: string
  amount: number
}

export function useMatchTracker() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [name, setName] = useState<string>("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  // 1) On mount, read from local storage:
  // On mount, load everything from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("userName")
    const storedSessions = localStorage.getItem("sessions")
    const storedTransactions = localStorage.getItem("transactions")
    const storedSelectedSession = localStorage.getItem("selectedSession")

    // (1) Load userName
    if (storedName) {
      setName(storedName)
    }

    // (2) Load sessions
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions))
    }

    // (3) Load transactions
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    }

    // (4) Load selectedSession
    if (storedSelectedSession) {
      setSelectedSession(storedSelectedSession)
    }
  }, [])

  // Whenever "name" changes, save to localStorage
  useEffect(() => {
    localStorage.setItem("userName", name)
  }, [name])

  // 2) Whenever sessions change, rewrite local storage:
  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);
  // 3) Whenever transactions change, rewrite local storage:
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // 4) Persist selected session as well
  useEffect(() => {
    if (selectedSession) {
      localStorage.setItem("selectedSession", selectedSession);
    } else {
      localStorage.removeItem("selectedSession");
    }
  }, [selectedSession]);
  const createSession = (name: string, courtFee: number) => {
    const newSession: Session = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      courtFee,
    }
    setSessions([...sessions, newSession])
  }

  const deleteSession = (sessionId: string) => {
    // Remove from state
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setTransactions((prev) => prev.filter((t) => t.sessionId !== sessionId));

    // If the deleted session was selected, clear selection
    setSelectedSession((prev) => (prev === sessionId ? null : prev));

    // ❌ Do NOT removeItem("sessions") or removeItem("transactions")
    // because that erases *all* sessions & transactions from localStorage.
  };

  const addTransaction = (
    sessionId: string,
    type: "Match" | "SideBet",
    amount: number,
    players: string[],
    payerIndex: number,
    receiverIndex: number,
    bettorWon?: boolean,
    userSide?: "Bettor" | "Bookmaker",
  ) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      sessionId,
      type,
      amount,
      players,
      payerIndex,
      receiverIndex,
      timestamp: Date.now(),
      bettorWon,
      userSide,
    }
    setTransactions([...transactions, newTransaction])
  }

  const updateTransaction = (
    transactionId: string,
    type: "Match" | "SideBet",
    amount: number,
    players: string[],
    payerIndex: number,
    receiverIndex: number,
    bettorWon?: boolean,
    userSide?: "Bettor" | "Bookmaker",
  ) => {
    setTransactions(
      transactions.map((t) =>
        t.id === transactionId ? { ...t, type, amount, players, payerIndex, receiverIndex, bettorWon, userSide } : t,
      ),
    )
  }

  const getSessionTransactions = (sessionId: string) => {
    return transactions.filter((t) => t.sessionId === sessionId)
  }

  const calculateNetGain = (sessionId: string) => {
    return getSessionTransactions(sessionId).reduce((sum, t) => {
      if (t.type === "Match") {
        return sum + (t.receiverIndex < t.payerIndex ? t.amount : -t.amount)
      } else if (t.type === "SideBet") {
        const userWon = (t.bettorWon && t.userSide === "Bettor") || (!t.bettorWon && t.userSide === "Bookmaker")
        return sum + (userWon ? t.amount : -t.amount)
      }
      return sum
    }, 0)
  }

  const calculateTotalWinnings = () => {
    return transactions.reduce((sum, t) => {
      if (t.type === "Match") {
        return sum + (t.receiverIndex < t.payerIndex ? t.amount : 0)
      } else if (t.type === "SideBet") {
        const userWon = (t.bettorWon && t.userSide === "Bettor") || (!t.bettorWon && t.userSide === "Bookmaker")
        return sum + (userWon ? t.amount : 0)
      }
      return sum
    }, 0)
  }

  const calculateTotalLosses = () => {
    return transactions.reduce((sum, t) => {
      if (t.type === "Match") {
        return sum + (t.receiverIndex > t.payerIndex ? t.amount : 0)
      } else if (t.type === "SideBet") {
        const userLost = (t.bettorWon && t.userSide === "Bookmaker") || (!t.bettorWon && t.userSide === "Bettor")
        return sum + (userLost ? t.amount : 0)
      }
      return sum
    }, 0)
  }

  const calculateSideBetWinnings = () => {
    return transactions.reduce((sum, t) => {
      if (t.type === "SideBet") {
        const userWon = (t.bettorWon && t.userSide === "Bettor") || (!t.bettorWon && t.userSide === "Bookmaker")
        return sum + (userWon ? t.amount : 0)
      }
      return sum
    }, 0)
  }

  const calculateSideBetLosses = () => {
    return transactions.reduce((sum, t) => {
      if (t.type === "SideBet") {
        const userLost = (t.bettorWon && t.userSide === "Bookmaker") || (!t.bettorWon && t.userSide === "Bettor")
        return sum + (userLost ? t.amount : 0)
      }
      return sum
    }, 0)
  }

  const calculateNetGainTotal = () => {
    return calculateTotalWinnings() - calculateTotalLosses()
  }

  const calculateTotalCourtFees = () => {
    return sessions.reduce((sum, session) => sum + session.courtFee, 0)
  }

  const calculateSettlement = (sessionId: string): Settlement[] => {
    const sessionTransactions = getSessionTransactions(sessionId)
    const playerBalances: { [key: string]: number } = {}

    // Calculate initial balances
    sessionTransactions.forEach((t) => {
      if (t.type === "Match") {
        playerBalances[t.players[t.payerIndex]] = (playerBalances[t.players[t.payerIndex]] || 0) - t.amount
        playerBalances[t.players[t.receiverIndex]] = (playerBalances[t.players[t.receiverIndex]] || 0) + t.amount
      } else if (t.type === "SideBet") {
        const bettorIndex = 4
        const bookmakerIndex = 5
        if (t.bettorWon) {
          playerBalances[t.players[bettorIndex]] = (playerBalances[t.players[bettorIndex]] || 0) + t.amount
          playerBalances[t.players[bookmakerIndex]] = (playerBalances[t.players[bookmakerIndex]] || 0) - t.amount
        } else {
          playerBalances[t.players[bettorIndex]] = (playerBalances[t.players[bettorIndex]] || 0) - t.amount
          playerBalances[t.players[bookmakerIndex]] = (playerBalances[t.players[bookmakerIndex]] || 0) + t.amount
        }
      }
    })

    // Convert to array and sort
    const sortedBalances = Object.entries(playerBalances)
      .map(([name, balance]) => ({ name, balance }))
      .sort((a, b) => a.balance - b.balance)

    const settlements: Settlement[] = []
    let i = 0
    let j = sortedBalances.length - 1

    while (i < j) {
      const debtor = sortedBalances[i]
      const creditor = sortedBalances[j]

      if (Math.abs(debtor.balance) < creditor.balance) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: Math.abs(debtor.balance),
        })
        creditor.balance += debtor.balance
        i++
      } else {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: creditor.balance,
        })
        debtor.balance += creditor.balance
        j--
      }
    }

    // Prioritize payments to cover the user's losses
    const userSettlements = settlements.filter((s) => s.to === "Me" || s.from === "Me")
    const otherSettlements = settlements.filter((s) => s.to !== "Me" && s.from !== "Me")

    return [...userSettlements, ...otherSettlements]
  }

  return {
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
  }
}

