// app/api/auth/reset-password/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { applyRateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";
import {
    type PasswordResetTokenPayload,
    verifyPasswordResetToken,
} from "@/lib/passwordReset";

export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
        const rateLimitResult = applyRateLimit({
            request: req,
            routeKey: RATE_LIMIT.AUTH.RESET_PASSWORD.ROUTE_KEY,
            limit: RATE_LIMIT.AUTH.RESET_PASSWORD.LIMIT,
            windowMs: RATE_LIMIT.AUTH.RESET_PASSWORD.WINDOW_MS,
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

        const body: unknown = await req.json();

        const parsed = resetPasswordSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { token, newPassword } = parsed.data;

        let decodedToken: PasswordResetTokenPayload;
        try {
            decodedToken = verifyPasswordResetToken(token);
        } catch (err) {
            console.error("Token verification failed:", err);
            return NextResponse.json(
                { error: "ลิงก์หมดอายุหรือไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateResult = await prisma.user.updateMany({
            where: {
                id: Number(decodedToken.userId),
                passwordResetVersion: decodedToken.resetVersion,
            },
            data: {
                password: hashedPassword,
                passwordResetVersion: {
                    increment: 1,
                },
                sessionVersion: {
                    increment: 1,
                },
            },
        });

        if (updateResult.count === 0) {
            return NextResponse.json(
                { error: "ลิงก์หมดอายุหรือไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                message:
                    "รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
            },
            { status: 200, headers: rateLimitResult.headers }
        );
    } catch (error) {
        console.error("Error during password reset:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
            { status: 500 }
        );
    }
}
