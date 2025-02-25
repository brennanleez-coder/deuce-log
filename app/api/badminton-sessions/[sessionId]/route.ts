import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId; // Extract session ID from URL
    const { name, courtFee, players } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Check if the session exists before updating
    const existingSession = await prisma.badmintonSession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const updatedSession = await prisma.badmintonSession.update({
      where: { id: sessionId },
      data: { name, courtFee, players },
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

export async function DELETE(req: Request, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Check if the session exists before deleting
    const existingSession = await prisma.badmintonSession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Delete the session
    await prisma.badmintonSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json(
      { message: "Session deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}