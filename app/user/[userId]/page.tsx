"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/useUser";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Check, UserPlus } from "lucide-react";
import Loader from "@/components/FullScreenLoader";

export default function UserProfile() {
  const router = useRouter();
  const params = useParams();
  const profileUserId = params?.userId as string;
  const { userId } = useUser();

  const {
    handleAddFriend,
    handleAccept,
    handleReject,
    isAdding,
    isAccepting,
    isRejecting,
  } = useFriendRequests(userId);

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const user = users?.find((u: any) => u.id === profileUserId);
  const isSelf = userId === profileUserId;

  const isFriends = user?.incomingRequests?.some(
    (req: any) => req.senderId === userId && req.status === "ACCEPTED"
  ) ||
  user?.friendRequests?.some(
    (req: any) => req.receiverId === userId && req.status === "ACCEPTED"
  );

  const requestSent = user?.incomingRequests?.some(
    (req: any) => req.senderId === userId && req.status === "PENDING"
  );

  const requestReceived = user?.friendRequests?.some(
    (req: any) => req.receiverId === userId && req.status === "PENDING"
  );

  if (isLoading) return <Loader fullScreen />;
  if (isError || !user) return <p className="text-center text-red-500">User not found.</p>;

  return (
    <main className="min-h-screen font-sans px-4 md:px-8 pt-16 text-slate-700 bg-white">
      <div className="max-w-xl mx-auto flex flex-col gap-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
        </div>

        <div className="flex flex-col items-center text-center gap-4">
          <Avatar className="h-20 w-20">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || "User"} />
            ) : (
              <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
            )}
          </Avatar>
          <h1 className="text-2xl font-semibold text-slate-800">
            {user.name || "Unknown User"}
          </h1>
          <div className="text-sm text-slate-500">
            <p>Sessions: {user.badmintonSessions || 0}</p>
            <p>Matches: {user.transactions || 0}</p>
          </div>

          {!isSelf && (
            <div className="flex gap-2">
              {isFriends ? (
                <Button disabled size="sm" variant="ghost" className="text-green-600">
                  <Check className="w-4 h-4 mr-1" /> Friends
                </Button>
              ) : requestSent ? (
                <Button disabled size="sm" variant="ghost" className="text-slate-400">
                  <Clock className="w-4 h-4 mr-1" /> Request Sent
                </Button>
              ) : requestReceived ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAccept(user.id)}
                    disabled={isAccepting}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => handleReject(user.id)}
                    disabled={isRejecting}
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleAddFriend(user.id)}
                  disabled={isAdding}
                  size="sm"
                  variant="ghost"
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus className="w-4 h-4 mr-1" /> Add Friend
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
