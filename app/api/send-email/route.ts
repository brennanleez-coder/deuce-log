import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { bugReport } = await req.json();

    if (!bugReport) {
      return NextResponse.json({ error: "Bug report is required" }, { status: 400 });
    }

    const response = await resend.emails.send({
      from: "Bug Report <noreply@yourdomain.com>",
      to: ["brennanlee95@gmail.com"],
      subject: "DeuceLog: Bug Report",
      text: `Bug Report:\n\n${bugReport}`,
    });

    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
