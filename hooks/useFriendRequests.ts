import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
type FriendRequestAction = "ACCEPTED" | "DECLINED";
type FriendRequestPayload = { friendId: string };

// Main Hook
export function useFriendRequests(userId: string) {
  const queryClient = useQueryClient();

  // ─── FETCH ───
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["friendRequests", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/requests`);
      if (!res.ok) throw new Error("Failed to fetch friend requests");
      return res.json();
    },
    staleTime: 1000 * 60,
    enabled: !!userId,
  });

  // ─── MUTATIONS ───

  const addFriend = useMutation({
    mutationFn: async ({ friendId }: FriendRequestPayload) => {
      const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify({ userId, friendId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to send friend request");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Failed to send friend request");
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({
      friendId,
      action,
    }: FriendRequestPayload & { action: FriendRequestAction }) => {
      const res = await fetch("/api/users", {
        method: "PATCH",
        body: JSON.stringify({ userId, friendId, action }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Failed to ${action.toLowerCase()} request`);
      return res.json();
    },
    onSuccess: (_, { action }) => {
      const actionText =
        action === "ACCEPTED" ? "Friend request accepted!" : "Friend request rejected.";
      toast.success(actionText);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests", userId] });
    },
    onError: (_, { action }) => {
      const actionText = action === "ACCEPTED" ? "accept" : "reject";
      toast.error(`Failed to ${actionText} request`);
    },
  });

  // ─── Handlers ───

  const handleAddFriend = (friendId: string) => {
    if (!userId || !friendId || userId === friendId) return;
    addFriend.mutate({ friendId });
  };

  const handleAccept = (friendId: string) => {
    updateRequest.mutate({ friendId, action: "ACCEPTED" });
  };

  const handleReject = (friendId: string) => {
    updateRequest.mutate({ friendId, action: "DECLINED" });
  };

  return {
    friendRequests: data || [],
    isLoading,
    isError,
    error,
    handleAddFriend,
    handleAccept,
    handleReject,
    isAdding: addFriend.isPending,
    isAccepting: updateRequest.isPending && updateRequest.variables?.action === "ACCEPTED",
    isRejecting: updateRequest.isPending && updateRequest.variables?.action === "DECLINED",
  };
}
