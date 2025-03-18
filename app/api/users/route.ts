import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        badmintonSessions: true,
        transactions: true
      },
    });

    const redactedUsers = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        badmintonSessions: user.badmintonSessions.length,
        transactions: user.transactions.length
      };
    });

    return NextResponse.json(redactedUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
