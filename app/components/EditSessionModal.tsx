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
import { useMatchTracker } from "@/hooks/useMatchTracker";

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
  const { editSession } = useMatchTracker();
  const [name, setName] = useState(currentName);
  const [courtFee, setCourtFee] = useState(currentCourtFee);
  const [players, setPlayers] = useState(currentPlayers.join(", "));
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await editSession({
        sessionId,
        name,
        courtFee,
        players: players.split(",").map((p) => p.trim()),
      });
    } catch (error: any) {
      console.error("Error saving session:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
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
          <div>
            <Label>Players (comma-separated)</Label>
            <Input
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              placeholder="Enter player names"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
