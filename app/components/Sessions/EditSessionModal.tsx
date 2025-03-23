"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
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

type FormData = {
  sessionName: string;
  courtFee: number;
};

export default function EditSessionModal({
  sessionId,
  currentName,
  currentCourtFee,
  currentPlayers,
}: EditSessionProps) {
  const { editSession } = useBadmintonSessions();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      sessionName: currentName,
      courtFee: currentCourtFee,
    },
  });

  // Called when the user submits the form
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await editSession.mutateAsync({
        sessionId,
        name: data.sessionName,
        courtFee: data.courtFee,
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error saving session:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: If the modal closes, reset the form
  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset({
        sessionName: currentName,
        courtFee: currentCourtFee,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Session</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Session Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="sessionName">Session Name</Label>
            <Input
              id="sessionName"
              placeholder="Enter session name"
              {...register("sessionName", {
                required: "Session name is required",
              })}
            />
            {errors.sessionName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.sessionName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="courtFee">Court Fee ($)</Label>
            <Input
              type="number"
              id="courtFee"
              step="0.01"
              {...register("courtFee", {
                required: "Court fee is required",
                valueAsNumber: true,
              })}
            />
            {errors.courtFee && (
              <p className="text-red-500 text-sm mt-1">
                {errors.courtFee.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <ClipLoader size={16} color="white" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
