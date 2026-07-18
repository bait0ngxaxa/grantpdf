import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import {
    isAdmin,
    isGuardError,
    requireResourceOwnerOrAdmin,
    requireUserSession,
} from "@/lib/server/auth/guards";
import { generateSignedUrl } from "@/lib/server/storage/signedUrl";
import { generateSignedUrlSchema } from "@/lib/validation/schemas";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import {
    publicErrorResponse,
    validationErrorResponse,
} from "@/lib/api/responses";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await readJsonBody(req);
        const parsed = generateSignedUrlSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const guard = await requireUserSession();
        if (isGuardError(guard)) return guard;
        const { fileId, type, expiresIn, fromAdminPanel } = parsed.data;

        const admin = isAdmin(guard.session);

        // Verify user has access to this file
        if (type === "userFile") {
            const file = await prisma.userFile.findFirst({
                where: {
                    id: fileId,
                    deletionStatus: FILE_DELETION_STATUS.ACTIVE,
                },
                select: { userId: true },
            });

            if (!file) {
                return NextResponse.json(
                    { error: "ไม่พบไฟล์" },
                    { status: 404 }
                );
            }

            // Only owner or admin can generate URL
            const ownerError = requireResourceOwnerOrAdmin(
                guard,
                file.userId,
                "ไม่มีสิทธิ์เข้าถึงไฟล์นี้",
            );
            if (ownerError) return ownerError;
        } else if (type === "attachment") {
            const attachment = await prisma.attachmentFile.findFirst({
                where: {
                    id: fileId,
                    userFile: {
                        deletionStatus: FILE_DELETION_STATUS.ACTIVE,
                    },
                },
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

            const ownerError = requireResourceOwnerOrAdmin(
                guard,
                attachment.userFile.userId,
                "ไม่มีสิทธิ์เข้าถึงไฟล์แนบนี้",
            );
            if (ownerError) return ownerError;
        }

        // Generate signed URL - only pass fromAdminPanel if user is actually admin
        const signedUrl = await generateSignedUrl(
            fileId,
            guard.userId,
            type,
            expiresIn,
            admin && fromAdminPanel
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
