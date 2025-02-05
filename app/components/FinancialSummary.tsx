import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FinancialSummaryProps {
  totalWinnings: number
  totalLosses: number
  netGain: number
  sideBetWinnings: number
  sideBetLosses: number
  totalCourtFees: number
}

export default function FinancialSummary({
  totalWinnings,
  totalLosses,
  netGain,
  sideBetWinnings,
  sideBetLosses,
  totalCourtFees,
}: FinancialSummaryProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-md text-gray-800">
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-50 border border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-green-600">Total Winnings</h3>
              <p className="text-2xl font-bold text-green-700">
                {totalWinnings.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className="text-sm text-green-600">
                (Including {sideBetWinnings.toLocaleString("en-US", { style: "currency", currency: "USD" })} from side
                bets)
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-red-600">Total Losses</h3>
              <p className="text-2xl font-bold text-red-700">
                {totalLosses.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className="text-sm text-red-600">
                (Including {sideBetLosses.toLocaleString("en-US", { style: "currency", currency: "USD" })} from side
                bets)
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-gray-600">Net Gain</h3>
              <p className={`text-3xl font-bold ${netGain >= 0 ? "text-green-700" : "text-red-700"}`}>
                {netGain.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className={`text-sm ${netGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                (Including{" "}
                {(sideBetWinnings - sideBetLosses).toLocaleString("en-US", { style: "currency", currency: "USD" })} from
                side bets)
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-gray-50 border border-gray-200 mt-4">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-600">Total Court Fees</h3>
            <p className="text-2xl font-bold text-gray-700">
              {totalCourtFees.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

