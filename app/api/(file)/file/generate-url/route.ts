import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateSignedUrl } from "@/lib/signedUrl";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const {
            fileId,
            type = "userFile",
            expiresIn = 3600,
            fromAdminPanel = false,
        } = body;

        if (!fileId) {
            return NextResponse.json(
                { error: "File ID is required" },
                { status: 400 }
            );
        }

        const userId = parseInt(session.user.id);
        const isAdmin = session.user.role === "admin";

        // Verify user has access to this file
        if (type === "userFile") {
            const file = await prisma.userFile.findUnique({
                where: { id: Number(fileId) },
                select: { userId: true },
            });

            if (!file) {
                return NextResponse.json(
                    { error: "File not found" },
                    { status: 404 }
                );
            }

            // Only owner or admin can generate URL
            if (file.userId !== userId && !isAdmin) {
                return NextResponse.json(
                    { error: "Access denied" },
                    { status: 403 }
                );
            }
        } else if (type === "attachment") {
            const attachment = await prisma.attachmentFile.findUnique({
                where: { id: Number(fileId) },
                include: {
                    userFile: {
                        select: { userId: true },
                    },
                },
            });

            if (!attachment) {
                return NextResponse.json(
                    { error: "Attachment not found" },
                    { status: 404 }
                );
            }

            if (attachment.userFile.userId !== userId && !isAdmin) {
                return NextResponse.json(
                    { error: "Access denied" },
                    { status: 403 }
                );
            }
        }

        // Generate signed URL - only pass fromAdminPanel if user is actually admin
        const signedUrl = await generateSignedUrl(
            Number(fileId),
            userId,
            type,
            expiresIn,
            isAdmin && fromAdminPanel
        );

        return NextResponse.json({
            success: true,
            signedUrl,
            expiresIn,
        });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return NextResponse.json(
            { error: "Failed to generate signed URL" },
            { status: 500 }
        );
    }
}
