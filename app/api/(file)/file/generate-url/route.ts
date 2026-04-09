import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSignedUrl } from "@/lib/signedUrl";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";
import { generateSignedUrlSchema } from "@/lib/validation/schemas";
import { ROLES } from "@/lib/constants";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const sessionUserId = parsePositiveIntId(session.user.id);
        if (sessionUserId === null) {
            throw publicApiError(401, "กรุณาเข้าสู่ระบบ");
        }

        const body: unknown = await req.json();
        const parsed = generateSignedUrlSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
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
        const mappedError = toPublicApiError(error, "ไม่สามารถสร้างลิงก์ดาวน์โหลดได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
