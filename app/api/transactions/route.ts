import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const userId = searchParams.get("userId");

    const transactions = await prisma.transaction.findMany({
      where: {
        ...(sessionId ? { sessionId } : {}),
        ...(userId ? { userId } : {}),
      },
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      sessionId,
      userId,
      type,
      amount,
      team1,
      team2,
      payer,
      receiver,
      bettor,
      bookmaker,
      bettorWon,
    } = await req.json();

    if (!sessionId || !userId || !type || !amount || !team1 || !team2) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "MATCH" && (!payer || !receiver)) {
      return NextResponse.json({ error: "Match transactions require payer and receiver" }, { status: 400 });
    }

    if (type === "SIDEBET" && (!bettor || !bookmaker || bettorWon === undefined)) {
      return NextResponse.json({ error: "SideBet transactions require bettor, bookmaker, and bettorWon" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        sessionId,
        userId,
        type,
        amount,
        team1,
        team2,
        timestamp: new Date(),
        payer: type === "MATCH" ? payer : null,
        receiver: type === "MATCH" ? receiver : null,
        bettor: type === "SIDEBET" ? bettor : null,
        bookmaker: type === "SIDEBET" ? bookmaker : null,
        bettorWon: type === "SIDEBET" ? bettorWon : null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("id");

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return NextResponse.json({ message: "Transaction deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
