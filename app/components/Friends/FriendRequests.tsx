"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import Loader from "@/components/FullScreenLoader";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import Link from "next/link";

const FriendRequests = () => {
  const { userId } = useUser();
  const { friendRequests, isLoading, error } = useFriendRequests(userId);

  const badgeCount = friendRequests?.length || 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer flex items-center gap-2">
          <div className="relative">
            <UserPlus className="h-5 w-5 text-slate-600" />
            {badgeCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 text-[10px] h-4 w-4 p-0 flex items-center justify-center rounded-full"
              >
                {badgeCount}
              </Badge>
            )}
          </div>
          <span className="text-sm text-slate-700">Friend Requests</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Pending Friend Requests</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Loader fullScreen />
        ) : error ? (
          <p className="text-sm text-red-500">Error loading requests.</p>
        ) : (
          <div className="flex flex-col gap-4 mt-2 h-[60vh] overflow-y-auto pr-2">
            <div className="text-center mt-2">
              <Link
                href="/discover-players"
                className="text-sm text-blue-600 hover:underline"
              >
                Discover More Players →
              </Link>
            </div>
            {friendRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center my-auto">
                You have no pending friend requests.
              </p>
            ) : (
              friendRequests.map((req: any) => (
                <div
                  key={req.requestId}
                  className="flex justify-between items-center border rounded-lg p-3"
                >
                  <div className="flex items-center gap-3 max-w-[65%] sm:max-w-full">
                    <Image
                      src={req.senderImage || "/default-avatar.png"}
                      alt={req.senderName}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                    <span className="text-sm sm:text-base font-medium truncate">
                      {req.senderName}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-muted-foreground"
                    >
                      Reject
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Accept
                    </Button>
                  </div>
                </div>
              ))
            )}

            
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FriendRequests;
