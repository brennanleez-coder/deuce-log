import { useState, useEffect, useRef } from "react";
import type { Transaction } from "../../hooks/useMatchTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trophy,
  Edit,
  Coins,
  User,
  Banknote,
  Save,
  PlusCircle,
} from "lucide-react";

interface TransactionInterfaceProps {
  user: string;
  sessionId: string;
  addTransaction: (
    sessionId: string,
    type: "Match" | "SideBet",
    amount: number,
    players: string[],
    payerIndex: number,
    receiverIndex: number,
    bettorWon?: boolean,
    userSide?: "Bettor" | "Bookmaker"
  ) => void;
  updateTransaction: (
    transactionId: string,
    type: "Match" | "SideBet",
    amount: number,
    players: string[],
    payerIndex: number,
    receiverIndex: number,
    bettorWon?: boolean,
    userSide?: "Bettor" | "Bookmaker"
  ) => void;
  transactions: Transaction[];
}

export default function TransactionInterface({
  user,
  sessionId,
  addTransaction,
  updateTransaction,
  transactions,
}: TransactionInterfaceProps) {
  console.log(transactions);
  // Always use the passed in user as Player 1 (index 0).
  const [transactionType, setTransactionType] = useState<"Match" | "SideBet">(
    "Match"
  );
  const [amount, setAmount] = useState("");
  const [players, setPlayers] = useState<string[]>([user, "", "", "", "", ""]);
  const [payerIndex, setPayerIndex] = useState(2);
  const [receiverIndex, setReceiverIndex] = useState(0);
  const [bettorWon, setBettorWon] = useState(false);
  const [userSide, setUserSide] = useState<"Bettor" | "Bookmaker">("Bettor");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const transactionsEndRef = useRef<HTMLDivElement | null>(null);

  // 2. Whenever `transactions` changes, scroll to the bottom
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (transactions.length > 0) {
      transactionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transactions]);
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (editingTransaction) {
      // When editing, ensure that Player 1 remains the current user.
      setTransactionType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setPlayers([user, ...editingTransaction.players.slice(1)]);
      setPayerIndex(editingTransaction.payerIndex);
      setReceiverIndex(editingTransaction.receiverIndex);
      setBettorWon(editingTransaction.bettorWon || false);
      setUserSide(editingTransaction.userSide || "Bettor");
    } else {
      resetForm();
    }
  }, [editingTransaction, user]);

  const resetForm = () => {
    // Reset the form with Player 1 preset as the user.
    setTransactionType("Match");
    setAmount("");
    setPlayers([user, "", "", "", "", ""]);
    setPayerIndex(2);
    setReceiverIndex(0);
    setBettorWon(false);
    setUserSide("Bettor");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Require at least 4 non-empty players (Player 1 is always set).
    if (amount && players.filter(Boolean).length >= 4) {
      if (editingTransaction) {
        updateTransaction(
          editingTransaction.id,
          transactionType,
          Number.parseFloat(amount),
          players,
          payerIndex,
          receiverIndex,
          transactionType === "SideBet" ? bettorWon : undefined,
          transactionType === "SideBet" ? userSide : undefined
        );
        setEditingTransaction(null);
      } else {
        addTransaction(
          sessionId,
          transactionType,
          Number.parseFloat(amount),
          players,
          payerIndex,
          receiverIndex,
          transactionType === "SideBet" ? bettorWon : undefined,
          transactionType === "SideBet" ? userSide : undefined
        );
      }
      resetForm();
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    resetForm();
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
      <CardHeader className="bg-gray-50 rounded-t-xl">
        <CardTitle className="text-xl font-bold text-gray-800">
          Transaction Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            value={transactionType}
            onValueChange={(value) =>
              setTransactionType(value as "Match" | "SideBet")
            }
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="Match"
                id="match"
                className="peer sr-only"
              />
              <Label
                htmlFor="match"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Trophy className="mb-2 h-6 w-6 text-yellow-600" />
                <span className="font-semibold">Match</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="SideBet"
                id="sideBet"
                className="peer sr-only"
              />
              <Label
                htmlFor="sideBet"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Coins className="mb-2 h-6 w-6 text-emerald-600" />
                <span className="font-semibold">Side Bet</span>
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <fieldset className="space-y-3 rounded-lg border p-4">
                <legend className="px-2 text-sm font-medium text-gray-700">
                  Your Pair
                </legend>
                <div className="space-y-2">
                  {/* Player 1 is always the user and disabled */}
                  <Input
                    value={user}
                    disabled
                    placeholder="Player 1 name"
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <Input
                    value={players[1]}
                    onChange={(e) =>
                      setPlayers([user, e.target.value, ...players.slice(2)])
                    }
                    placeholder="Player 2 name"
                    className="bg-white"
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-3 rounded-lg border p-4">
                <legend className="px-2 text-sm font-medium text-gray-700">
                  Opponent Pair
                </legend>
                <div className="space-y-2">
                  <Input
                    value={players[2]}
                    onChange={(e) =>
                      setPlayers([
                        ...players.slice(0, 2),
                        e.target.value,
                        players[3],
                        ...players.slice(4),
                      ])
                    }
                    placeholder="Player 3 name"
                    className="bg-white"
                  />
                  <Input
                    value={players[3]}
                    onChange={(e) =>
                      setPlayers([
                        ...players.slice(0, 3),
                        e.target.value,
                        ...players.slice(4),
                      ])
                    }
                    placeholder="Player 4 name"
                    className="bg-white"
                  />
                </div>
              </fieldset>
            </div>

            {transactionType === "SideBet" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Your Role</Label>
                  <Select
                    value={userSide}
                    onValueChange={(value) =>
                      setUserSide(value as "Bettor" | "Bookmaker")
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        disabled={true}
                        value="Bettor"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" /> Bettor
                      </SelectItem>
                      {/* <SelectItem
                        value="Bookmaker"
                        className="flex items-center gap-2"
                      >
                        <Banknote className="h-4 w-4" /> Bookmaker
                      </SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {userSide === "Bettor" ? "Bookmaker Name" : "Bettor Name"}
                  </Label>
                  <Input
                    value={players[4]} // Using the 5th index to store the opponent’s name.
                    onChange={(e) =>
                      setPlayers([...players.slice(0, 4), e.target.value])
                    }
                    placeholder={
                      userSide === "Bettor"
                        ? "Enter Bookmaker name"
                        : "Enter Bettor name"
                    }
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-8 bg-white"
                />
              </div>
            </div>

            {transactionType === "Match" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Winning Person</Label>
                  <Select
                    value={receiverIndex.toString()}
                    onValueChange={(value) => setReceiverIndex(Number(value))}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select winners" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.slice(0, 4).map(
                        (player, index) =>
                          player && (
                            <SelectItem key={index} value={index.toString()}>
                              {index < 2
                                ? `Team 1: ${player}`
                                : `Team 2: ${player}`}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Paying Person</Label>
                  <Select
                    value={payerIndex.toString()}
                    onValueChange={(value) => setPayerIndex(Number(value))}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select payers" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.slice(0, 4).map(
                        (player, index) =>
                          player && (
                            <SelectItem key={index} value={index.toString()}>
                              {index < 2
                                ? `Team 1: ${player}`
                                : `Team 2: ${player}`}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {transactionType === "SideBet" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center space-x-3 p-4 rounded-lg border bg-white">
                  <Checkbox
                    id="bettorWon"
                    checked={bettorWon}
                    onCheckedChange={(checked) =>
                      setBettorWon(checked as boolean)
                    }
                  />
                  <Label htmlFor="bettorWon" className="text-sm font-medium">
                    Bettor Won the Wager
                  </Label>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingTransaction ? (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" /> Update Transaction
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Transaction
                  </span>
                )}
              </Button>
              {editingTransaction && (
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Transaction History
            <span className="ml-2 text-sm text-gray-500">
              ({transactions.length} recorded)
            </span>
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {transactions.map((transaction: any) => {
              let settlementColor = "text-red-600"; // default color

              if (transaction.type === "Match") {
                // Match color logic
                const userIsWinner =
                  transaction.players[transaction.receiverIndex] === user;
                settlementColor = userIsWinner
                  ? "text-green-600"
                  : "text-red-600";
              } else if (transaction.type === "SideBet") {
                const userIsWinner =
                  transaction.userSide === "Bettor" && transaction.bettorWon;
                settlementColor = userIsWinner
                  ? "text-green-600"
                  : "text-red-600";
              }

              return (
                <Card
                  key={transaction.id}
                  className="border-gray-200 hover:border-blue-200 transition-colors group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            transaction.type === "Match"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {transaction.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <div
                        className={`text-lg font-semibold ${settlementColor}`}
                      >
                        {transaction.amount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </div>
                    </div>

                    {transaction.type === "Match" ? (
                      // New layout: two team cards with a VS in the middle
                      (() => {
                        // Determine the winning team based on receiverIndex
                        const winningTeam =
                          transaction.receiverIndex < 2 ? 1 : 2;
                        return (
                          <div className="flex items-center justify-between">
                            {/* Team 1 */}
                            <div
                              className={`flex flex-col items-center p-4 border rounded-lg w-5/12 ${
                                winningTeam === 1
                                  ? "bg-green-100 border-green-500"
                                  : "bg-white"
                              }`}
                            >
                              <div className="font-semibold text-gray-800">
                                Team 1
                              </div>
                              <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
                                {transaction.players
                                  .slice(0, 2)
                                  .map((player: string, i: string) => (
                                    <p key={i}>{player}</p>
                                  ))}
                              </div>
                            </div>

                            {/* VS Separator */}
                            <div className="flex flex-col items-center">
                              <span className="text-xl font-bold text-gray-700">
                                VS
                              </span>
                            </div>

                            {/* Team 2 */}
                            <div
                              className={`flex flex-col items-center p-4 border rounded-lg w-5/12 ${
                                winningTeam === 2
                                  ? "bg-green-100 border-green-500"
                                  : "bg-white"
                              }`}
                            >
                              <div className="font-semibold text-gray-800">
                                Team 2
                              </div>
                              <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
                                {transaction.players
                                  .slice(2, 4)
                                  .map((player: string, i: string) => (
                                    <p key={i}>{player}</p>
                                  ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      // For SideBet transactions, retain the existing layout
                      <div>
                        {/* 2v2 Team Cards */}
                        <div className="flex items-center justify-between">
                          {/* Team 1 */}
                          <div className="flex flex-col items-center p-4 border rounded-lg w-5/12">
                            <div className="font-semibold text-gray-800">
                              Team 1
                            </div>
                            <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
                              {transaction.players
                                .slice(0, 2)
                                .map((player: string, i: string) => (
                                  <p key={i}>{player}</p>
                                ))}
                            </div>
                          </div>

                          {/* VS Separator */}
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-gray-700">
                              VS
                            </span>
                          </div>

                          {/* Team 2 */}
                          <div className="flex flex-col items-center p-4 border rounded-lg w-5/12">
                            <div className="font-semibold text-gray-800">
                              Team 2
                            </div>
                            <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
                              {transaction.players
                                .slice(2, 4)
                                .map((player: string, i: string) => (
                                  <p key={i}>{player}</p>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Existing SideBet details below */}
                        <div className="space-y-2 text-sm mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="text-gray-500">Bettor</div>
                              <div className="font-medium">
                                {transaction.players[0]}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-gray-500">Bookmaker</div>
                              <div className="font-medium">
                                {transaction.players[4]}
                              </div>
                            </div>
                          </div>
                          <div className="pt-2 text-sm border-t">
                            <span className="text-gray-500">Outcome: </span>
                            <span className="font-medium">
                              {transaction.bettorWon
                                ? "You Won"
                                : `${transaction.players[4]} Won`}
                              {" • "}
                              <span className="text-blue-600">
                                Your Side: {transaction.userSide}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => handleEdit(transaction)}
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-blue-600 hover:text-blue-800 px-0"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Transaction
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            <div ref={transactionsEndRef} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
