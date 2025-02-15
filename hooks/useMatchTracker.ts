'use client'
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
  paid?: boolean
  paidBy?: string
}

export interface Session {
  id: string
  name: string
  createdAt: number
  courtFee: number
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


  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedName = localStorage.getItem("userName")
    const storedSessions = localStorage.getItem("sessions")
    const storedTransactions = localStorage.getItem("transactions")
    const storedSelectedSession = localStorage.getItem("selectedSession")

    if (storedName) setName(storedName)
    if (storedSessions) setSessions(JSON.parse(storedSessions))
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions))
    if (storedSelectedSession) setSelectedSession(storedSelectedSession)
  }, [])


  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem("userName", name)
  }, [name])


  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem("sessions", JSON.stringify(sessions))
  }, [sessions])


  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem("transactions", JSON.stringify(transactions))
  }, [transactions])


  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedSession) {
      localStorage.setItem("selectedSession", selectedSession)
    } else {
      localStorage.removeItem("selectedSession")
    }
  }, [selectedSession])


  const createSession = (sessionName: string, courtFee: number) => {
    const newSession: Session = {
      id: Date.now().toString(),
      name: sessionName,
      createdAt: Date.now(),
      courtFee,
    }
    setSessions((prev) => [...prev, newSession])
  }


  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    setTransactions((prev) => prev.filter((t) => t.sessionId !== sessionId))

  
    setSelectedSession((prev) => (prev === sessionId ? null : prev))
  }

  

  const addTransaction = (
    sessionId: string,
    type: "Match" | "SideBet",
    amount: number,
    players: string[],
    payerIndex: number,
    receiverIndex: number,
    bettorWon?: boolean,
    userSide?: "Bettor" | "Bookmaker"
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
      paid: false,       
      paidBy: undefined, 
    }
    setTransactions((prev) => [...prev, newTransaction])
  }



  const markTransactionPaid = (transactionId: string, paidBy: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? {
            ...t,
            paid: true,
            paidBy,
          }
          : t
      )
    )
  }

  const updateTransaction = (
    transactionId: string,
    type: "Match" | "SideBet",
    amount: number,
    players: string[],
    payerIndex: number,
    receiverIndex: number,
    bettorWon?: boolean,
    userSide?: "Bettor" | "Bookmaker"
  ) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? {
            ...t,
            type,
            amount,
            players,
            payerIndex,
            receiverIndex,
            bettorWon,
            userSide,
          }
          : t
      )
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
        const userWon =
          (t.bettorWon && t.userSide === "Bettor") ||
          (!t.bettorWon && t.userSide === "Bookmaker")
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
        const userWon =
          (t.bettorWon && t.userSide === "Bettor") ||
          (!t.bettorWon && t.userSide === "Bookmaker")
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
        const userLost =
          (t.bettorWon && t.userSide === "Bookmaker") ||
          (!t.bettorWon && t.userSide === "Bettor")
        return sum + (userLost ? t.amount : 0)
      }
      return sum
    }, 0)
  }

  const calculateSideBetWinnings = () => {
    return transactions.reduce((sum, t) => {
      if (t.type === "SideBet") {
        const userWon =
          (t.bettorWon && t.userSide === "Bettor") ||
          (!t.bettorWon && t.userSide === "Bookmaker")
        return sum + (userWon ? t.amount : 0)
      }
      return sum
    }, 0)
  }

  const calculateSideBetLosses = () => {
    return transactions.reduce((sum, t) => {
      if (t.type === "SideBet") {
        const userLost =
          (t.bettorWon && t.userSide === "Bookmaker") ||
          (!t.bettorWon && t.userSide === "Bettor")
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
    const playerBalances: { [name: string]: number } = {}

  
    sessionTransactions.forEach((t) => {
      t.players.forEach((p) => {
        if (!playerBalances[p]) {
          playerBalances[p] = 0
        }
      })
    })

  
    sessionTransactions.forEach((t) => {
      if (t.type === "Match") {
        const payer = t.players[t.payerIndex]
        const receiver = t.players[t.receiverIndex]
        playerBalances[payer] -= t.amount
        playerBalances[receiver] += t.amount
      } else if (t.type === "SideBet") {
      
        const payer = t.players[t.payerIndex]
        const receiver = t.players[t.receiverIndex]

        if (t.bettorWon) {
        
          playerBalances[payer] -= t.amount
          playerBalances[receiver] += t.amount
        } else {
        
          playerBalances[payer] += t.amount
          playerBalances[receiver] -= t.amount
        }
      }
    })

  
    const sortedBalances = Object.entries(playerBalances)
      .map(([name, balance]) => ({ name, balance }))
      .sort((a, b) => a.balance - b.balance)

  
    const settlements: Settlement[] = []
    let i = 0
    let j = sortedBalances.length - 1

    while (i < j) {
      const debtor = sortedBalances[i]
      const creditor = sortedBalances[j]

      const amount = Math.min(Math.abs(debtor.balance), creditor.balance)
      if (amount > 0) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount,
        })
      }

    
      debtor.balance += amount
      creditor.balance -= amount

      if (debtor.balance === 0) i++
      if (creditor.balance === 0) j--
    }

  
    const userSettlements = settlements.filter(
      (s) => s.to === name || s.from === name
    )
    const otherSettlements = settlements.filter(
      (s) => s.to !== name && s.from !== name
    )

    return [...userSettlements, ...otherSettlements]
  }

  return {
    name,
    setName,
    sessions,
    createSession,
    deleteSession,
    addTransaction,
    updateTransaction,
    getSessionTransactions,
    selectedSession,
    setSelectedSession,
    calculateNetGain,
    calculateTotalWinnings,
    calculateTotalLosses,
    calculateNetGainTotal,
    calculateSideBetWinnings,
    calculateSideBetLosses,
    calculateTotalCourtFees,
    calculateSettlement,
    markTransactionPaid,

  }
}
