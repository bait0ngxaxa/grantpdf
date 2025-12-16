//เส้นดึงข้อมูลจาก table userFile มาแสดงผล dashboard admin

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const allUserFiles = await prisma.userFile.findMany({
            orderBy: {
                created_at: "desc",
            },
            select: {
                id: true,
                originalFileName: true,
                storagePath: true,
                created_at: true,
                updated_at: true,
                fileExtension: true,
                downloadStatus: true,
                downloadedAt: true,
                userId: true,

                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },

                attachmentFiles: {
                    select: {
                        id: true,
                        fileName: true,
                        filePath: true,
                        fileSize: true,
                        mimeType: true,
                    },
                },
            },
        });

        const sanitizedFiles = allUserFiles.map((file) => ({
            id: file.id.toString(),
            originalFileName: file.originalFileName,
            storagePath: file.storagePath,
            created_at: file.created_at,
            updated_at: file.updated_at,
            fileExtension: file.fileExtension,
            downloadStatus: file.downloadStatus,
            downloadedAt: file.downloadedAt,
            userId: file.userId.toString(),

            userName: file.user?.name || "Unknown User",
            userEmail: file.user?.email || "Unknown Email",

            attachmentFiles:
                file.attachmentFiles?.map((attachment) => ({
                    ...attachment,
                    id: attachment.id.toString(),
                })) || [],
        }));

        return NextResponse.json(sanitizedFiles, { status: 200 });
    } catch (error) {
        console.error("Error fetching all documents:", error);
        return NextResponse.json(
            { error: "Failed to fetch all documents" },
            { status: 500 }
        );
    }
}
