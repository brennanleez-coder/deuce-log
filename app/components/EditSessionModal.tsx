"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import { ClipLoader } from "react-spinners";

interface EditSessionProps {
  sessionId: string;
  currentName: string;
  currentCourtFee: number;
  currentPlayers: string[];
}

export default function EditSessionModal({
  sessionId,
  currentName,
  currentCourtFee,
  currentPlayers,
}: EditSessionProps) {
  const { editSession, sessions } = useBadmintonSessions();
  const [name, setName] = useState(currentName);
  const [courtFee, setCourtFee] = useState(currentCourtFee);
  const [players, setPlayers] = useState(currentPlayers.join(", "));
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    // Store previous state in case of rollback
    const prevSessions = [...sessions];

    // Optimistically update UI
    const updatedSession = {
      sessionId,
      name,
      courtFee,
      players: players.split(",").map((p) => p.trim()),
    };

    // Update UI before API call
    editSession(updatedSession);

    try {
      await editSession(updatedSession);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error saving session:", error.message);
      
      // Rollback UI if API fails
      editSession(prevSessions.find((s) => s.id === sessionId)!);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Session</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Session Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Session Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter session name"
            />
          </div>
          <div>
            <Label>Court Fee ($)</Label>
            <Input
              type="number"
              value={courtFee}
              onChange={(e) => setCourtFee(parseFloat(e.target.value) || 0)}
            />
          </div>
          {/* <div>
            <Label>Players (comma-separated)</Label>
            <Input
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              placeholder="Enter player names"
            />
          </div> */}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? <ClipLoader size={16} color="white" /> : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
