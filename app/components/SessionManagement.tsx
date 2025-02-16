"use client";

import { useState } from "react";
import { Session } from "@/types/types";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Trash2, Plus, Search } from "lucide-react";

interface SessionManagementProps {
  sessions: Session[];
  name: string;
  setName: (name: string) => void;
  createSession: (name: string, courtFee: number, players: string[]) => void;
  calculateNetGain: (sessionId: string) => number;
  selectedSession: string | null;
  setSelectedSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => void;
}

export default function SessionManagement({
  sessions,
  name,
  setName,
  createSession,
  calculateNetGain,
  selectedSession,
  setSelectedSession,
  deleteSession,
}: SessionManagementProps) {
  const [newSessionName, setNewSessionName] = useState("");
  const [newCourtFee, setNewCourtFee] = useState("");
  const [newPlayers, setNewPlayers] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  const [formErrors, setFormErrors] = useState<{
    userName?: string;
    name?: string;
    fee?: string;
  }>({});

  // Determine if this is the very first session
  const isFirstSession = sessions.length === 0;

  // Filter sessions by search term (case-insensitive, partial match)
  const filteredSessions = sessions.filter((session) =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validate user's name
  const validateUserName = () => {
    if (!name.trim()) {
      setFormErrors((prev) => ({ ...prev, userName: "Name is required" }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, userName: undefined }));
    return true;
  };

  // Handle name submission
  const handleNameSubmit = () => {
    if (validateUserName()) {
      setName(name.trim());
      setIsEditingName(false);
    }
  };

  // Validate the "New Session" form
  const validateForm = () => {
    const errors: { userName?: string; name?: string; fee?: string } = {};
    if (isFirstSession && !name.trim()) errors.userName = "Name is required";
    if (!newSessionName.trim()) errors.name = "Session name is required";

    const feeValue = Number.parseFloat(newCourtFee);
    if (isNaN(feeValue) || feeValue < 0) {
      errors.fee = "Valid court fee is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the "New Session" form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // If it's the first session, ensure the user name is set
    if (isFirstSession) {
      setName(name.trim());
    }

    // Create the new session
    const playersArray = newPlayers
      .split(",")
      .map((player) => player.trim())
      .filter((player) => player);
    createSession(
      newSessionName.trim(),
      Number.parseFloat(newCourtFee),
      playersArray
    );

    // Clear form
    setNewSessionName("");
    setNewCourtFee("");
    setNewPlayers("");
    setFormErrors({});
    setIsModalOpen(false);
  };

  // Confirm & delete a session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      "Are you sure you want to delete this session?"
    );
    if (confirmed) {
      deleteSession(sessionId);
    }
  };

  // Format the session date
  const formatDate = (dateNumber: number) => {
    const date = new Date(dateNumber);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
      {/* HEADER with "Sessions" title + "New Session" button (side by side) */}
      <CardHeader className="bg-gray-50 rounded-t-xl px-6 py-4 flex items-center justify-between">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <CardTitle className="w-full text-xl font-bold text-gray-800 flex items-center justify-between">
              <div>Sessions</div>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={16} />
                  New Session
                </Button>
              </DialogTrigger>
          </CardTitle>

          {/* Button to open "New Session" dialog */}

          {/* The "Create Session" Dialog */}
          <DialogContent className="max-w-lg rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-800">
                Create New Session
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Start tracking your matches by creating a new session.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Only show "Your Name" field if it's the first session */}
              {isFirstSession && (
                <div>
                  <Label htmlFor="userNameModal" className="text-gray-700">
                    Your Name
                  </Label>
                  <Input
                    id="userNameModal"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={formErrors.userName ? "border-red-500" : ""}
                    autoFocus
                  />
                  {formErrors.userName && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.userName}
                    </p>
                  )}
                </div>
              )}

              <div>
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
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
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
                  <p className="text-sm text-red-500 mt-1">{formErrors.fee}</p>
                )}
              </div>

              <div>
                <Label htmlFor="playersInput" className="text-gray-700">
                  Players (comma-separated)
                </Label>
                <Input
                  id="playersInput"
                  type="text"
                  value={newPlayers}
                  onChange={(e) => setNewPlayers(e.target.value)}
                  placeholder="Player1, Player2, Player3"
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Plus size={16} />
                Create Session
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Name Edit Section (only show if not the first session) */}
        {!isFirstSession && (
          <div className="mb-6 rounded-lg border border-gray-200 p-4 bg-gray-50">
            <Label htmlFor="userName" className="font-semibold text-gray-700">
              Your Name
            </Label>
            <div className="mt-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="userName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={formErrors.userName ? "border-red-500" : ""}
                    autoFocus
                  />
                  <Button variant="secondary" onClick={handleNameSubmit}>
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="userName"
                    type="text"
                    value={name}
                    className="bg-gray-100"
                    disabled
                  />
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingName(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
              {formErrors.userName && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.userName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Search field */}
        <div className="relative max-w-sm w-full mb-4">
          <Input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Sessions */}
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg bg-gray-100">
            <p className="text-gray-500">No sessions created yet</p>
            <p className="text-sm text-gray-400">
              Get started by creating a new session.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 min-w-[120px]">
                    Session Name
                  </TableHead>
                  <TableHead className="w-1/4 min-w-[100px]">
                    Created At
                  </TableHead>
                  <TableHead className="w-1/4 min-w-[100px]">
                    Court Fee
                  </TableHead>
                  <TableHead className="w-1/4 min-w-[100px]">
                    Net Gain
                  </TableHead>
                  <TableHead className="text-right min-w-[60px]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSessions.map((session) => {
                  const netGain = calculateNetGain(session.id);
                  const isSelected = selectedSession === session.id;

                  return (
                    <TableRow
                      key={session.id}
                      onClick={() => setSelectedSession(session.id)}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="truncate">{session.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(session.createdAt)}</TableCell>
                      <TableCell>
                        {session.courtFee.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            netGain >= 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {netGain.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredSessions.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No sessions match your search.
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* We have removed the floating action button for "New Session" entirely */}
      {/* If you still need a floating button for "Add Transaction," you can place it below. */}
    </Card>
  );
}
