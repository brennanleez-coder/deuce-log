"use client";

import { useState } from "react";
import type { Session } from "../../hooks/useMatchTracker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, Trash2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";


const containerVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      when: "beforeChildren",      
      staggerChildren: 0.08,      
      delayChildren: 0.1,         
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

interface SessionManagementProps {
  sessions: Session[];
  name: string;
  setName: (name: string) => void;
  createSession: (name: string, courtFee: number) => void;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; fee?: string; userName?: string }>({});
  const [isEditingName, setIsEditingName] = useState(false);

  // Determine if this is the first session
  const isFirstSession = sessions.length === 0;

  // Validate the user's name
  const validateUserName = () => {
    if (!name.trim()) {
      setFormErrors((prev) => ({ ...prev, userName: "Name is required" }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, userName: undefined }));
    return true;
  };

  // Handle name submission with validation
  const handleNameSubmit = () => {
    if (validateUserName()) {
      setName(name.trim());
      setIsEditingName(false);
    }
  };

  // Validate the form for creating a session
  const validateForm = () => {
    const errors: { name?: string; fee?: string; userName?: string } = {};
    if (!newSessionName.trim()) errors.name = "Session name is required";
    if (isFirstSession && !name.trim()) errors.userName = "Name is required";
    const feeValue = Number.parseFloat(newCourtFee);
    if (isNaN(feeValue) || feeValue < 0) {
      errors.fee = "Valid court fee is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission for creating a session
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isFirstSession) {
        setName(name.trim());
      }
      createSession(newSessionName.trim(), Number.parseFloat(newCourtFee));
      setNewSessionName("");
      setNewCourtFee("");
      setIsModalOpen(false);
      setFormErrors({});
    }
  };

  // Handle session deletion
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const confirmed = window.confirm(
      "Are you sure you want to delete this session?"
    );
    if (confirmed) {
      deleteSession(sessionId);
    }
  };

  // Format date
  const formatDate = (dateString: number) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
      {/* HEADER */}
      <CardHeader className="flex flex-col gap-2 px-6 py-4 bg-gray-50 rounded-t-xl">
        <CardTitle className="flex justify-between items-center w-full">
          <span className="text-lg font-bold text-gray-800">Sessions</span>

          {/* Normal "New Session" button - hidden on small screens */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <div className="hidden md:block">
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                  <Plus size={16} />
                  New Session
                </Button>
              </DialogTrigger>
            </div>

            <DialogContent className="rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-gray-800">
                  Create New Session
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Start tracking your matches by creating a new session.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isFirstSession && (
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="text-gray-700">
                      Your Name
                    </Label>
                    <Input
                      id="userName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className={formErrors.userName ? "border-red-500" : ""}
                      autoFocus
                    />
                    {formErrors.userName && (
                      <p className="text-sm text-red-500">{formErrors.userName}</p>
                    )}
                  </div>
                )}
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
        </CardTitle>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="p-6">
        {/* Name Edit Section */}
        {!isFirstSession && (
          <div className="mb-6 rounded-lg border border-gray-200 p-4 bg-gray-50">
            <Label htmlFor="userName" className="text-gray-700 font-semibold">
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
                    className={formErrors.userName ? "border-red-500" : "bg-white"}
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
                  <Button variant="outline" onClick={() => setIsEditingName(true)}>
                    Edit
                  </Button>
                </div>
              )}
              {formErrors.userName && (
                <p className="text-sm text-red-500">{formErrors.userName}</p>
              )}
            </div>
          </div>
        )}

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg bg-gray-100">
            <p className="text-gray-500">No sessions created yet</p>
            <p className="text-sm text-gray-400">
              Get started by creating a new session.
            </p>
          </div>
        ) : (
          
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AnimatePresence>
              {sessions.map((session) => {
                const netGain = calculateNetGain(session.id);
                const isSelected = selectedSession === session.id;

                return (
                  
                  <motion.div
                    key={session.id}
                    variants={itemVariants}
                    layout
                    exit="exit" 
                  >
                    <Card
                      onClick={() => setSelectedSession(session.id)}
                      className={`relative cursor-pointer transition-all duration-200 group 
                        ${
                          isSelected
                            ? "border-blue-500 ring-2 ring-blue-500/20"
                            : "border-gray-200 hover:shadow-md hover:border-blue-200"
                        }`}
                    >
                      {/* SELECTED ICON */}
                      {isSelected && (
                        <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-500" />
                      )}
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {session.name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="opacity-60 hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
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
                            {/* NET GAIN/LOSS BADGE */}
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium 
                                ${
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>

      {/* Floating Action Button for small screens */}
      <div className="md:hidden fixed bottom-16 right-4 z-50">
        <Button
          variant="outline"
          className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
