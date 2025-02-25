export interface Transaction {
  id?: string;
  sessionId: string;
  userId: string;
  type: "MATCH" | "SIDEBET";
  amount: number;
  team1: string[]; // Players in team 1
  team2: string[]; // Players in team 2
  timestamp: number | string;
  paid?: boolean;
  paidBy?: string;

  // Fields specific to Match transactions
  payer?: string; // The player who is paying (must be from team1 or team2)
  receiver?: string; // The player who is receiving the amount (must be from team1 or team2)

  // Fields specific to SideBet transactions
  bettor?: string; // The player who placed the bet
  bookmaker?: string; // The player who took the bet
  bettorWon?: boolean; // Indicates if the bettor won
  userSide?: "Bettor" | "Bookmaker"; // Perspective of the user
}


export interface BadmintonSession {
    id: string
    name: string
    createdAt: number | string
    courtFee: number
    players?: string[];
  
  }
  
  export interface Settlement {
    id: string; // Unique identifier for each settlement
    from: string;
    to: string;
    amount: number;
    timestamp: string; // ISO date string
    transactionId: string; // Links to a Transaction
  }
  

export interface HeadToHeadStats {
  [opponent: string]: {
    matches: number;
    wins: number;
    losses: number;
    net: number; // money net from that opponent
  };
}