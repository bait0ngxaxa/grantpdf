import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { auth } from "@/lib/server/auth/session";
import { generateSignedUrl } from "@/lib/server/storage/signedUrl";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { generateSignedUrlSchema } from "@/lib/validation/schemas";
import { ROLES } from "@/lib/shared/constants";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import {
    publicErrorResponse,
    unauthorizedResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await readJsonBody(req);
        const parsed = generateSignedUrlSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const session = await auth();
        if (!session || !session.user?.id) {
            return unauthorizedResponse();
        }

        const sessionUserId = parsePositiveIntId(session.user.id);
        if (sessionUserId === null) {
            return unauthorizedResponse();
        }
        const { fileId, type, expiresIn, fromAdminPanel } = parsed.data;

        const isAdmin = session.user.role === ROLES.ADMIN;

        // Verify user has access to this file
        if (type === "userFile") {
            const file = await prisma.userFile.findUnique({
                where: { id: fileId },
                select: { userId: true },
            });

            if (!file) {
                return NextResponse.json(
                    { error: "ไม่พบไฟล์" },
                    { status: 404 }
                );
            }

            // Only owner or admin can generate URL
            if (file.userId !== sessionUserId && !isAdmin) {
                return NextResponse.json(
                    { error: "ไม่มีสิทธิ์เข้าถึงไฟล์นี้" },
                    { status: 403 }
                );
            }
        } else if (type === "attachment") {
            const attachment = await prisma.attachmentFile.findUnique({
                where: { id: fileId },
                include: {
                    userFile: {
                        select: { userId: true },
                    },
                },
            });

            if (!attachment) {
                return NextResponse.json(
                    { error: "ไม่พบไฟล์แนบ" },
                    { status: 404 }
                );
            }

            if (attachment.userFile.userId !== sessionUserId && !isAdmin) {
                return NextResponse.json(
                    { error: "ไม่มีสิทธิ์เข้าถึงไฟล์แนบนี้" },
                    { status: 403 }
                );
            }
        }

        // Generate signed URL - only pass fromAdminPanel if user is actually admin
        const signedUrl = await generateSignedUrl(
            fileId,
            sessionUserId,
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
        return publicErrorResponse(
            error,
            "ไม่สามารถสร้างลิงก์ดาวน์โหลดได้",
        );
    }
}
