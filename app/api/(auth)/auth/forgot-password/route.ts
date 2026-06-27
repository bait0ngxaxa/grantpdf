// app/api/auth/forgot-password/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { sendPasswordResetEmail } from "@/lib/email";
import { applyRateLimit, getClientIP } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";
import { getStringField } from "@/lib/utils";
import { logAudit } from "@/lib/auditLog";
import {
    createPasswordResetToken,
    resolvePasswordResetBaseUrl,
} from "@/lib/passwordReset";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import {
    rateLimitExceededResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await readJsonBody(req);
        const ip = getClientIP(req);
        const emailIdentifier = getStringField(body, "email");
        const rateLimitResult = await applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.AUTH.FORGOT_PASSWORD.ROUTE_KEY,
            limit: RATE_LIMIT.AUTH.FORGOT_PASSWORD.LIMIT,
            windowMs: RATE_LIMIT.AUTH.FORGOT_PASSWORD.WINDOW_MS,
            identifier: emailIdentifier,
        });

        if (!rateLimitResult.success) {
            logAudit("PASSWORD_RESET_REQUEST", null, {
                details: {
                    attemptedEmail: emailIdentifier,
                    reason: "rate_limited",
                },
                ip,
                outcome: "failure",
            });

            return rateLimitExceededResponse(
                rateLimitResult,
                "มีการร้องขอมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
            );
        }

        const parsed = forgotPasswordSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const { email } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                passwordResetVersion: true,
            },
        });

        // คืน 200 เสมอเพื่อป้องกัน user enumeration attack
        if (!user) {
            logAudit("PASSWORD_RESET_REQUEST", null, {
                details: {
                    requestedEmail: email,
                    accountFound: false,
                },
                ip,
                outcome: "success",
            });

            return NextResponse.json(
                { message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว" },
                { status: 200, headers: rateLimitResult.headers }
            );
        }

        const token = createPasswordResetToken(
            user.id,
            user.passwordResetVersion
        );

        const resetUrl = new URL(
            "/reset-password",
            resolvePasswordResetBaseUrl()
        );
        resetUrl.searchParams.set("token", token);
        const resetLink = resetUrl.toString();

        await sendPasswordResetEmail({ email, resetLink });

        logAudit("PASSWORD_RESET_REQUEST", String(user.id), {
            userEmail: email,
            targetType: "user",
            targetId: String(user.id),
            details: {
                requestedEmail: email,
                accountFound: true,
            },
            ip,
        });

        return NextResponse.json(
            { message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว" },
            { status: 200, headers: rateLimitResult.headers }
        );
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในกระบวนการรีเซ็ตรหัสผ่าน:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
            { status: 500 }
        );
    }
}
