import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import {
    isAdmin,
    isGuardError,
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
import { buildAccessibleUserFileWhere } from "@/lib/services/projectService";

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
        const accessibleUserFileWhere = admin
            ? { deletionStatus: FILE_DELETION_STATUS.ACTIVE }
            : buildAccessibleUserFileWhere(guard.userId);

        // Verify user has access to this file or its project
        if (type === "userFile") {
            const file = await prisma.userFile.findFirst({
                where: { id: fileId, ...accessibleUserFileWhere },
                select: { userId: true },
            });

            if (!file) {
                return NextResponse.json(
                    { error: "ไม่พบไฟล์" },
                    { status: 404 }
                );
            }

        } else if (type === "attachment") {
            const attachment = await prisma.attachmentFile.findFirst({
                where: {
                    id: fileId,
                    userFile: accessibleUserFileWhere,
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
