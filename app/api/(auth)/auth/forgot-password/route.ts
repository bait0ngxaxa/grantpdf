// app/api/auth/forgot-password/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { sendPasswordResetEmail } from "@/lib/email";
import { applyRateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";
import { getStringField } from "@/lib/utils";
import {
    createPasswordResetToken,
    resolvePasswordResetBaseUrl,
} from "@/lib/passwordReset";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body: unknown = await req.json();
        const emailIdentifier = getStringField(body, "email");
        const rateLimitResult = await applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.AUTH.FORGOT_PASSWORD.ROUTE_KEY,
            limit: RATE_LIMIT.AUTH.FORGOT_PASSWORD.LIMIT,
            windowMs: RATE_LIMIT.AUTH.FORGOT_PASSWORD.WINDOW_MS,
            identifier: emailIdentifier,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: "มีการร้องขอมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
                    retryAfter: rateLimitResult.retryAfter,
                },
                { status: 429, headers: rateLimitResult.headers }
            );
        }

        const parsed = forgotPasswordSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
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
