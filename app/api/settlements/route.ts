import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    const settlement = await prisma.settlement.findUnique({
      where: { transactionId },
    });

    return NextResponse.json(settlement, { status: 200 });
  } catch (error) {
    console.error("Error fetching settlement:", error);
    return NextResponse.json({ error: "Failed to fetch settlement" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { from, to, amount, transactionId } = await req.json();

    if (!from || !to || !amount || !transactionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if settlement already exists for this transaction
    const existingSettlement = await prisma.settlement.findUnique({
      where: { transactionId },
    });

    if (existingSettlement) {
      return NextResponse.json({ error: "A settlement already exists for this transaction" }, { status: 400 });
    }

    const settlement = await prisma.settlement.create({
      data: {
        from,
        to,
        amount,
        transactionId,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(settlement, { status: 201 });
  } catch (error) {
    console.error("Error creating settlement:", error);
    return NextResponse.json({ error: "Failed to create settlement" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    await prisma.settlement.delete({
      where: { transactionId },
    });

    return NextResponse.json({ message: "Settlement deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting settlement:", error);
    return NextResponse.json({ error: "Failed to delete settlement" }, { status: 500 });
  }
}
