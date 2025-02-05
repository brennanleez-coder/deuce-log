import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Settlement {
  from: string
  to: string
  amount: number
}

interface SettlementSummaryProps {
  user: string;
  settlements: Settlement[]
}

export default function SettlementSummary({ user, settlements }: SettlementSummaryProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-md text-gray-800">
      <CardHeader>
        <CardTitle>Settlement Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {settlements.map((settlement, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">
                <span className="font-medium">{settlement.from}</span> pays{" "}
                <span className="font-medium">{settlement.to}</span>
              </span>
              <span className={`font-bold ${settlement.from === user ? "text-red-600" : "text-green-600"}`}>
                {settlement.amount.toLocaleString("en-US", { style: "currency", currency: "SGD" })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

