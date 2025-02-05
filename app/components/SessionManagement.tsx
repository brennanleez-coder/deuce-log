import { useState } from "react"
import type { Session } from "../../hooks/useMatchTracker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowUpCircle, ArrowDownCircle, Plus } from "lucide-react"

interface SessionManagementProps {
  sessions: Session[]
  setName: (name:string) => void,
  createSession: (name: string, courtFee: number) => void
  calculateNetGain: (sessionId: string) => number
  selectedSession: string | null
  setSelectedSession: (sessionId: string | null) => void
}

export default function SessionManagement({
  sessions,
  setName,
  createSession,
  calculateNetGain,
  selectedSession,
  setSelectedSession,
}: SessionManagementProps) {
  const [newSessionName, setNewSessionName] = useState("")
  const [newCourtFee, setNewCourtFee] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<{ name?: string; fee?: string }>({})

  const validateForm = () => {
    const errors: { name?: string; fee?: string } = {}
    if (!newSessionName.trim()) errors.name = "Session name is required"
    if (isNaN(Number.parseFloat(newCourtFee)) || Number.parseFloat(newCourtFee) < 0)
      errors.fee = "Valid court fee is required"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      createSession(newSessionName.trim(), Number.parseFloat(newCourtFee))
      setNewSessionName("")
      setNewCourtFee("")
      setIsModalOpen(false)
      setFormErrors({})
    }
  }

  const formatDate = (dateString: number) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4 bg-gray-50 rounded-t-xl">
        <CardTitle className="text-lg font-semibold text-gray-800">Sessions</CardTitle>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-2">
              <Plus size={16} />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-800">Create New Session</DialogTitle>
              <DialogDescription className="text-gray-600">
                Start tracking your matches by creating a new session
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionName" className="text-gray-700">
                  Session Name
                </Label>
                <Input
                  id="sessionName"
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Friday Night Session"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="courtFee" className="text-gray-700">
                  Court Fee
                </Label>
                <Input
                  id="courtFee"
                  type="number"
                  value={newCourtFee}
                  onChange={(e) => setNewCourtFee(e.target.value)}
                  placeholder="30.00"
                  step="0.01"
                  min="0"
                  className={formErrors.fee ? "border-red-500" : ""}
                />
                {formErrors.fee && (
                  <p className="text-sm text-red-500">{formErrors.fee}</p>
                )}
              </div>
              <Button type="submit" className="w-full gap-2">
                <Plus size={16} />
                Create Session
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4 bg-gray-50 rounded-b-xl">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg bg-gray-100/50">
            <p className="text-gray-500">No sessions created yet</p>
            <p className="text-sm text-gray-400">Get started by creating a new session</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => {
              const netGain = calculateNetGain(session.id)
              return (
                <Card
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedSession === session.id
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-gray-200 hover:border-blue-200"
                  } hover:shadow-md group`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {session.name}
                        </h3>
                        {netGain >= 0 ? (
                          <ArrowUpCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(session.createdAt)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Court Fee:</span>{" "}
                          {session.courtFee.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </div>
                        <div
                          className={`font-semibold ${
                            netGain >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {netGain.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}