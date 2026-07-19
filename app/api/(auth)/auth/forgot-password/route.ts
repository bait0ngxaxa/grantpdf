// app/api/auth/forgot-password/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { sendPasswordResetEmail } from "@/lib/server/email/email";
import { applyRateLimit, getClientIP } from "@/lib/server/rate-limit/rateLimit";
import { RATE_LIMIT, USER_LIFECYCLE_STATUS } from "@/lib/shared/constants";
import { getStringField } from "@/lib/shared/utils";
import { logAudit } from "@/lib/server/audit/auditLog";
import {
    createPasswordResetToken,
    resolvePasswordResetBaseUrl,
} from "@/lib/server/auth/passwordReset";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import {
    rateLimitExceededResponse,
    rateLimitUnavailableResponse,
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
            failurePolicy: "fail-closed",
            identifier: emailIdentifier,
        });

        if (rateLimitResult.unavailable) {
            return rateLimitUnavailableResponse(
                rateLimitResult.headers,
                "ระบบป้องกันการใช้งานไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
            );
        }

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
                status: true,
                deletedAt: true,
            },
        });

        const activeUser =
            user &&
            user.status === USER_LIFECYCLE_STATUS.ACTIVE &&
            user.deletedAt === null
                ? user
                : null;

        // คืน 200 เสมอเพื่อป้องกัน user enumeration attack
        if (!activeUser) {
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
            activeUser.id,
            activeUser.passwordResetVersion
        );

        const resetUrl = new URL(
            "/reset-password",
            resolvePasswordResetBaseUrl()
        );
        resetUrl.searchParams.set("token", token);
        const resetLink = resetUrl.toString();

        await sendPasswordResetEmail({ email, resetLink });

        logAudit("PASSWORD_RESET_REQUEST", String(activeUser.id), {
            userEmail: email,
            targetType: "user",
            targetId: String(activeUser.id),
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
