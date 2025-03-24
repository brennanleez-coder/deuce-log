"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus, Clock, Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Loader from "@/components/FullScreenLoader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const fetchUsers = async () => {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users.");
  return res.json();
};

const addFriend = async ({
  userId,
  friendId,
}: {
  userId: string;
  friendId: string;
}) => {
  const res = await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify({ userId, friendId }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to send friend request");
  return res.json();
};

// Accept or reject friend
const updateFriendRequest = async ({
  userId,
  friendId,
  action,
}: {
  userId: string;
  friendId: string;
  action: "ACCEPTED" | "DECLINED";
}) => {
  const res = await fetch("/api/users", {
    method: "PATCH",
    body: JSON.stringify({ userId, friendId, action }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to ${action.toLowerCase()} request`);
  return res.json();
};

const getBadgeForUser = (index: number, email: string) => {
  if (email === "brennanlee95@gmail.com") {
    return { text: "🏆 First Member", className: "bg-yellow-500 text-white" };
  } else if (index >= 2 && index <= 5) {
    return { text: "⭐ Core Member", className: "bg-blue-500 text-white" };
  } else if (index >= 6 && index <= 10) {
    return { text: "✨ Trusted Member", className: "bg-purple-500 text-white" };
  } else {
    return { text: "🔵 Community Member", className: "bg-gray-400 text-white" };
  }
};

export default function DiscoverPlayers() {
  const router = useRouter();
  const { userId } = useUser();
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    refetchInterval: 5000,
  });

  const { mutate: addFriendMutate, isPending: isAdding } = useMutation({
    mutationFn: addFriend,
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to send friend request"),
  });

  const { mutate: acceptFriendMutate, isPending: isAccepting } = useMutation({
    mutationFn: (vars: { userId: string; friendId: string }) =>
      updateFriendRequest({ ...vars, action: "ACCEPTED" }),
    onSuccess: () => {
      toast.success("Friend request accepted!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to accept request"),
  });

  const { mutate: rejectFriendMutate, isPending: isRejecting } = useMutation({
    mutationFn: (vars: { userId: string; friendId: string }) =>
      updateFriendRequest({ ...vars, action: "DECLINED" }),
    onSuccess: () => {
      toast.success("Friend request rejected.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to reject request"),
  });

  function handleAddFriend(friendId: string) {
    if (!userId || userId === friendId) return;
    addFriendMutate({ userId, friendId });
  }

  function handleAccept(senderId: string) {
    acceptFriendMutate({ userId: userId!, friendId: senderId });
  }

  function handleReject(senderId: string) {
    rejectFriendMutate({ userId: userId!, friendId: senderId });
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen font-sans px-4 md:px-10 pt-16 text-slate-700 bg-white"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative flex items-center justify-center mb-6"
        >
          <Button
            variant="ghost"
            className="absolute left-0 flex items-center gap-2"
            onClick={() => router.push("/track")}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>

          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Users className="w-6 h-6 text-blue-500" />
            Discover Players
          </h1>
        </motion.header>

        {isLoading && <Loader fullScreen />}
        {isError && <p className="text-red-500 text-center">Failed to load players.</p>}

        {!isLoading && !isError && users?.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {users.map((user: any, index: number) => {
              const badge = getBadgeForUser(index + 1, user.email);
              const isSelf = userId === user.id;

              const isFriends =
                user.incomingRequests?.some(
                  (req: any) =>
                    req.senderId === userId && req.status === "ACCEPTED"
                ) ||
                user.friendRequests?.some(
                  (req: any) =>
                    req.receiverId === userId && req.status === "ACCEPTED"
                );

              const requestSent = user.incomingRequests?.some(
                (req: any) => req.senderId === userId && req.status === "PENDING"
              );

              const requestReceived = user.friendRequests?.some(
                (req: any) => req.receiverId === userId && req.status === "PENDING"
              );

              return (
                <motion.div
                  key={user.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-xl p-5 flex flex-col items-center hover:shadow-md transition"
                >
                  <Avatar className="h-16 w-16">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name || "User"} />
                    ) : (
                      <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
                    )}
                  </Avatar>

                  <h2 className="mt-3 font-medium text-lg text-slate-800 text-center truncate">
                    {user.name || "Unknown"}
                  </h2>

                  <div className="mt-2 flex flex-col items-center gap-1 text-xs text-slate-500">
                    <span>Sessions: {user?.badmintonSessions || 0}</span>
                    <span>Matches: {user?.transactions || 0}</span>
                  </div>

                  <div className="mt-2">
                    <Badge className={`${badge.className} px-2 py-1`}>
                      {badge.text}
                    </Badge>
                  </div>

                  {!isSelf && (
                    <div className="mt-3 flex flex-col gap-2">
                      {isFriends ? (
                        <Button disabled size="sm" variant="ghost" className="text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          Friends
                        </Button>
                      ) : requestSent ? (
                        <Button
                          disabled
                          size="sm"
                          variant="ghost"
                          className="text-slate-400"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Request Sent
                        </Button>
                      ) : requestReceived ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleAccept(user.id)}
                            disabled={isAccepting}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-muted-foreground"
                            onClick={() => handleReject(user.id)}
                            disabled={isRejecting}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleAddFriend(user.id)}
                          disabled={isAdding}
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add Friend
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <p className="text-center text-slate-500">No players found.</p>
        )}
      </div>
    </motion.main>
  );
}
