import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        badmintonSessions: true,
        transactions: true,
        sentRequests: {
          select: {
            receiverId: true,
            status: true,
          },
        },
        receivedRequests: {
          select: {
            senderId: true,
            status: true,
          },
        },
      },
    });

    const redactedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      badmintonSessions: user.badmintonSessions.length,
      transactions: user.transactions.length,
      // Expose requests for matching friend status in UI
      friendRequests: user.sentRequests,
      incomingRequests: user.receivedRequests,
    }));

    return NextResponse.json(redactedUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  const { userId, friendId } = await req.json();

  if (!userId || !friendId || userId === friendId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const existingSentRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId: userId,
      receiverId: friendId,
    },
  });

  if (existingSentRequest) {
    return NextResponse.json(
      { error: "Friend request already sent" },
      { status: 409 }
    );
  }

  // Optional: Check if a request was already received from the other user
  const existingIncomingRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId: friendId,
      receiverId: userId,
    },
  });

  if (existingIncomingRequest) {
    return NextResponse.json(
      { error: "You have a pending request from this user" },
      { status: 409 }
    );
  }

  // Create a new friend request
  const request = await prisma.friendRequest.create({
    data: {
      senderId: userId,
      receiverId: friendId,
    },
  });

  return NextResponse.json(request, { status: 201 });
}

export async function PATCH(req: Request) {
  try {
    const { userId, friendId, action } = await req.json();

    if (!userId || !friendId || !["ACCEPTED", "DECLINED"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: friendId,
        receiverId: userId,
        status: "PENDING",
      },
    });

    if (!friendRequest) {
      return NextResponse.json(
        { error: "Friend request not found or not pending" },
        { status: 404 }
      );
    }

    const updatedRequest = await prisma.friendRequest.update({
      where: {
        id: friendRequest.id,
      },
      data: {
        status: action, // "ACCEPTED" or "DECLINED"
      },
    });

    if (action === "DECLINED") {
      await prisma.friendRequest.delete({ where: { id: friendRequest.id } });
      return NextResponse.json({ status: "DECLINED" }, { status: 200 });
    }

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error: any) {
    console.error("Error updating friend request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}