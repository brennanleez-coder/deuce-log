import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SIGNED_SESSION_SECRET || "supersecretkey";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY) as { sessionId: string };
    if (!decoded.sessionId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch session data
    const session = await prisma.badmintonSession.findUnique({
      where: { id: decoded.sessionId },
      include: {
        transactions: true,
        user: true
      }, // Include any necessary relations
    });
    console.log("Session:", session);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error("Error validating session:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
