import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Banknote } from "lucide-react"; // Example icons

interface FinancialSummaryProps {
  totalWinnings: number;
  totalLosses: number;
  netGain: number;
  sideBetWinnings: number;
  sideBetLosses: number;
  totalCourtFees: number;
}

export default function FinancialSummary({
  totalWinnings,
  totalLosses,
  netGain,
  sideBetWinnings,
  sideBetLosses,
  totalCourtFees,
}: FinancialSummaryProps) {
  // Helper to format currency
  const formatCurrency = (value: number) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD" });

  // Calculate sideBet net
  const sideBetNet = sideBetWinnings - sideBetLosses;

  // Determine color for netGain
  const netGainColor = netGain >= 0 ? "text-green-700" : "text-red-700";
  const netGainSubtextColor = netGain >= 0 ? "text-green-600" : "text-red-600";

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-xl text-gray-800">
      <CardHeader className="px-6 py-4 border-b">
        <CardTitle className="text-xl font-bold text-gray-800">
          Financial Summary
        </CardTitle>
        <p className="text-sm text-gray-600">
          A quick overview of your match & side bet finances
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Grid for Winnings, Losses, Net Gain */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Winnings Card */}
          <Card className="border-gray-200 bg-gray-50 rounded-lg shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center space-x-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <h3 className="text-md font-semibold">Total Winnings</h3>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(totalWinnings)}
              </p>
              <p className="text-sm text-green-600">
                <span className="font-medium">Side Bets:</span>{" "}
                {formatCurrency(sideBetWinnings)}
              </p>
            </CardContent>
          </Card>

          {/* Losses Card */}
          <Card className="border-gray-200 bg-gray-50 rounded-lg shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center space-x-2 text-red-600">
                <TrendingDown className="h-5 w-5" />
                <h3 className="text-md font-semibold">Total Losses</h3>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(totalLosses)}
              </p>
              <p className="text-sm text-red-600">
                <span className="font-medium">Side Bets:</span>{" "}
                {formatCurrency(sideBetLosses)}
              </p>
            </CardContent>
          </Card>

          {/* Net Gain Card */}
          <Card className="border-gray-200 bg-gray-50 rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center space-x-2 text-gray-700">
                <DollarSign className="h-5 w-5" />
                <h3 className="text-md font-semibold text-gray-700">
                  Net Gain
                </h3>
              </div>
              <p className={`text-3xl font-bold ${netGainColor}`}>
                {formatCurrency(netGain)}
              </p>
              <p className={`text-sm ${netGainSubtextColor}`}>
                Side Bets:{" "}
                <span className="font-medium">
                  {formatCurrency(sideBetNet)}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Court Fees */}
        <div className="mt-4">
          <Card className="border-gray-200 bg-gray-50 rounded-lg shadow-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center space-x-2 text-gray-600">
                <Banknote className="h-5 w-5" />
                <h3 className="text-md font-semibold text-gray-700">
                  Total Court Fees
                </h3>
              </div>
              <p className="text-2xl font-bold text-gray-700">
                {formatCurrency(totalCourtFees)}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
