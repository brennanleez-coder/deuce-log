import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { transactionId: string } }) {
  try {
    const transactionId = params.transactionId; // Extract transaction ID from URL

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const {
      type,
      amount,
      team1,
      team2,
      payer,
      receiver,
      bettor,
      bookmaker,
      bettorWon,
      paid,
      paidBy
    } = await req.json();

    // Check if transaction exists before updating
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Validate required fields based on transaction type
    if (!type || !amount || !team1 || !team2) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type === "MATCH" && (!payer || !receiver)) {
      return NextResponse.json(
        { error: "Match transactions require payer and receiver" },
        { status: 400 }
      );
    }

    if (type === "SIDEBET" && (!bettor || !bookmaker || bettorWon === undefined)) {
      return NextResponse.json(
        { error: "SideBet transactions require bettor, bookmaker, and bettorWon" },
        { status: 400 }
      );
    }

    // ✅ Update the transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        type,
        amount,
        team1,
        team2,
        payer: type === "MATCH" ? payer : null,
        receiver: type === "MATCH" ? receiver : null,
        bettor: type === "SIDEBET" ? bettor : null,
        bookmaker: type === "SIDEBET" ? bookmaker : null,
        bettorWon: type === "SIDEBET" ? bettorWon : null,
        paid,
        paidBy
      },
    });

    return NextResponse.json(updatedTransaction, { status: 200 });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}
