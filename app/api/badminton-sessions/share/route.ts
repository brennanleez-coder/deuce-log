import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SIGNED_SESSION_SECRET || "supersecretkey"; // Use ENV

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Generate a signed token (expires in 7 days)
    const token = jwt.sign({ sessionId }, SECRET_KEY, { expiresIn: "7d" });

    // Create the shareable URL
    const shareableLink = `${process.env.NEXT_PUBLIC_APP_URL}/session/shared/${token}`;

    return NextResponse.json({ shareableLink }, { status: 200 });
  } catch (error) {
    console.error("Error generating shareable link:", error);
    return NextResponse.json({ error: "Failed to generate link" }, { status: 500 });
  }
}