import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const session = await prisma.badmintonSession.findUnique({
        where: { id: sessionId },
        include: {
          user: true,
          transactions: false,
        },
      });

      return NextResponse.json(session, { status: 200 });
    }
    if (userId) {
      const sessions = await prisma.badmintonSession.findMany({
        where: { userId },
        include: {
          user: false,
          transactions: true,
        }, // Fetch the user along with sessions
      });

      return NextResponse.json(sessions, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}




export async function POST(req: Request) {
  try {
    const { name, courtFee, players, userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const session = await prisma.badmintonSession.create({
      data: {
        name,
        courtFee,
        players: players || [],
        userId, // Ensure session is linked to a user
      },
      include: { user: true }, // Include user details in the response
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create session", error },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const {
      sessionId,
      name,
      courtFee,
      players,
      oldPlayerName,
      newPlayerName,
    } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }
    if (!oldPlayerName || !newPlayerName) {
      return NextResponse.json(
        { error: "Both old and new player names are required" },
        { status: 400 }
      );
    }

    // Begin transaction
    const updatedSession = await prisma.$transaction(async (tx) => {
      // Fetch all transactions where the player appears
      const transactionsToUpdate = await tx.transaction.findMany({
        where: {
          sessionId,
          OR: [
            { team1: { has: oldPlayerName } },
            { team2: { has: oldPlayerName } },
            { payer: oldPlayerName },
            { receiver: oldPlayerName },
          ],
        },
      });

      // Ensure unique renaming by transforming the fetched transactions first
      const updatedTransactions = transactionsToUpdate.map((transaction) => ({
        id: transaction.id,
        team1: transaction.team1.map((p) =>
          p === oldPlayerName ? newPlayerName : p
        ),
        team2: transaction.team2.map((p) =>
          p === oldPlayerName ? newPlayerName : p
        ),
        payer: transaction.payer === oldPlayerName ? newPlayerName : transaction.payer,
        receiver: transaction.receiver === oldPlayerName ? newPlayerName : transaction.receiver,
      }));

      // Apply updates one-by-one to prevent duplication
      await Promise.all(
        updatedTransactions.map((updatedTransaction) =>
          tx.transaction.update({
            where: { id: updatedTransaction.id },
            data: {
              team1: updatedTransaction.team1,
              team2: updatedTransaction.team2,
              payer: updatedTransaction.payer,
              receiver: updatedTransaction.receiver,
            },
          })
        )
      );

      // Update the session with the new player name in the players array
      const updatedSession = await tx.badmintonSession.update({
        where: { id: sessionId },
        data: {
          name,
          courtFee,
          players: players.map((p: string) =>
            p === oldPlayerName ? newPlayerName : p
          ),
        },
        include: { transactions: true },
      });

      return updatedSession;
    });

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

