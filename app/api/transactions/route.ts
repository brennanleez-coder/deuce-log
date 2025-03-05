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
    console.log("sessionId =>", sessionId);
    console.log("userId =>", userId);
    console.log("type =>", type);
    console.log("amount =>", amount);
    console.log("team1 =>", team1);
    console.log("team2 =>", team2);
    console.log("payer =>", payer);
    console.log("receiver =>", receiver);
    // 1) Check top-level required fields
    const missingFields: string[] = [];
    if (!sessionId) missingFields.push("sessionId");
    if (!userId) missingFields.push("userId");
    if (!type) missingFields.push("type");
    if (!team1) missingFields.push("team1");
    if (!team2) missingFields.push("team2");
    if (amount === undefined || amount === null) missingFields.push("amount");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 2) If type === "MATCH", payer & receiver are required
    if (type === "MATCH") {
      const missingMatchFields: string[] = [];
      if (!payer) missingMatchFields.push("payer");
      if (!receiver) missingMatchFields.push("receiver");

      if (missingMatchFields.length > 0) {
        return NextResponse.json(
          {
            error: `Match transactions require: ${missingMatchFields.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // 3) If type === "SIDEBET", bettor, bookmaker, bettorWon are required
    if (type === "SIDEBET") {
      const missingSideBetFields: string[] = [];
      if (!bettor) missingSideBetFields.push("bettor");
      if (!bookmaker) missingSideBetFields.push("bookmaker");
      if (bettorWon === undefined) missingSideBetFields.push("bettorWon");

      if (missingSideBetFields.length > 0) {
        return NextResponse.json(
          {
            error: `SideBet transactions require: ${missingSideBetFields.join(", ")}`,
          },
          { status: 400 }
        );
      }
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
