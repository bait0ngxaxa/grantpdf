// เส้นแสดง dashboard user ทั่วไป
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

        const userId = Number(session.user.id);

        const userFiles = await prisma.userFile.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                created_at: "desc",
            },
            select: {
                id: true,
                originalFileName: true,
                storagePath: true,
                fileExtension: true,
                created_at: true,
                updated_at: true,

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

        const sanitizedFiles = userFiles.map((file) => ({
            ...file,
            id: file.id.toString(),
            userName: file.user?.name,
            attachmentFiles:
                file.attachmentFiles?.map((attachment) => ({
                    ...attachment,
                    id: attachment.id.toString(),
                })) || [],
        }));

        // กรองไฟล์ที่เป็น attachment ของไฟล์อื่นออก (ไม่ให้แสดงในรายการหลัก)
        const attachmentPaths = new Set(
            userFiles.flatMap(
                (file) => file.attachmentFiles?.map((att) => att.filePath) || []
            )
        );

        const filteredFiles = sanitizedFiles.filter(
            (file) => !attachmentPaths.has(file.storagePath)
        );

        return NextResponse.json(filteredFiles, { status: 200 });
    } catch (error) {
        console.error("Error fetching user documents:", error);
        return NextResponse.json(
            { error: "Failed to fetch user documents" },
            { status: 500 }
        );
    }
}
