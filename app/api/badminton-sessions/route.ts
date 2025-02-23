import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const sessions = await prisma.badmintonSession.findMany({
      where: { userId },
      include: { user: true }, // Fetch the user along with sessions
    });

    return NextResponse.json(sessions, { status: 200 });
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
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
