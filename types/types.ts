
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
    players?: string[];
  
  }
  
export interface Settlement {
    from: string
    to: string
    amount: number
  }

export interface HeadToHeadStats {
  [opponent: string]: {
    matches: number;
    wins: number;
    losses: number;
    net: number; // money net from that opponent
  };
}