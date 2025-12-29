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

        const sanitizedFiles = allUserFiles.map(
            (file: (typeof allUserFiles)[number]) => ({
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
                    file.attachmentFiles?.map(
                        (
                            attachment: NonNullable<
                                typeof file.attachmentFiles
                            >[number]
                        ) => ({
                            ...attachment,
                            id: attachment.id.toString(),
                        })
                    ) || [],
            })
        );

        // กรองไฟล์ที่เป็น attachment ของไฟล์อื่นออก (ไม่ให้แสดงในรายการหลัก)
        // ไฟล์ที่เป็น attachment จะมี storagePath เก็บใน attachmentFiles ของไฟล์อื่น
        const attachmentPaths = new Set(
            allUserFiles.flatMap(
                (file: (typeof allUserFiles)[number]) =>
                    file.attachmentFiles?.map(
                        (
                            att: NonNullable<
                                typeof file.attachmentFiles
                            >[number]
                        ) => att.filePath
                    ) || []
            )
        );

        const filteredFiles = sanitizedFiles.filter(
            (file: (typeof sanitizedFiles)[number]) =>
                !attachmentPaths.has(file.storagePath)
        );

        return NextResponse.json(filteredFiles, { status: 200 });
    } catch (error) {
        console.error("Error fetching all documents:", error);
        return NextResponse.json(
            { error: "Failed to fetch all documents" },
            { status: 500 }
        );
    }
}
