import { Transaction, Session } from "@/types/types";

type LayoutProps = {
  transaction: Transaction;
  user: string;
};
export const MatchLayout = ({ transaction, user }: LayoutProps) => {
  const winningTeam = transaction.receiverIndex < 2 ? 1 : 2;

  return (
    <div className="flex items-center justify-between mt-2">
      {/* Team 1 */}
      <div
        className={`flex flex-col items-center p-4 border rounded-lg w-5/12 ${
          winningTeam === 1 ? "bg-green-100 border-green-500" : "bg-white"
        }`}
      >
        <div className="font-semibold text-gray-800">Team 1</div>
        <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
          {transaction.players.slice(0, 2).map((player, i) => (
            <p key={i}>{player}</p>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-xl font-bold text-gray-700">VS</span>
      </div>

      {/* Team 2 */}
      <div
        className={`flex flex-col items-center p-4 border rounded-lg w-5/12 ${
          winningTeam === 2 ? "bg-green-100 border-green-500" : "bg-white"
        }`}
      >
        <div className="font-semibold text-gray-800">Team 2</div>
        <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
          {transaction.players.slice(2, 4).map((player, i) => (
            <p key={i}>{player}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SideBetLayout = ({ transaction, user }: LayoutProps) => {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center p-4 border rounded-lg w-5/12">
          <div className="font-semibold text-gray-800">Team 1</div>
          <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
            {transaction.players.slice(0, 2).map((player, i) => (
              <p key={i}>{player}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-gray-700">VS</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded-lg w-5/12">
          <div className="font-semibold text-gray-800">Team 2</div>
          <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
            {transaction.players.slice(2, 4).map((player, i) => (
              <p key={i}>{player}</p>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2 text-sm mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-gray-500">Bettor</div>
            <div className="font-medium">{transaction.players[0]}</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-500">Bookmaker</div>
            <div className="font-medium">{transaction.players[4]}</div>
          </div>
        </div>
        <div className="pt-2 text-sm border-t">
          <span className="text-gray-500">Outcome: </span>
          <span className="font-medium">
            {transaction.bettorWon
              ? "You Won"
              : `${transaction.players[4]} Won`}{" "}
            •{" "}
            <span className="text-blue-600">
              Your Side: {transaction.userSide}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
