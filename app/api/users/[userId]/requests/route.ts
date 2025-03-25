import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
    params: {
        userId: string;
    };
};

export async function GET(req: Request, { params }: Params) {
    const { userId } = params;

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        const pendingRequests = await prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: "PENDING",
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        const formatted = pendingRequests.map((req) => ({
            requestId: req.id,
            senderId: req.sender.id,
            senderName: req.sender.name,
            senderEmail: req.sender.email,
            senderImage: req.sender.image,
            status: req.status,
            createdAt: req.createdAt,
        }));

        return NextResponse.json(formatted, { status: 200 });
    } catch (error) {
        console.error("Error fetching pending friend requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch pending friend requests" },
            { status: 500 }
        );
    }
}
