// app/api/auth/forgot-password/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { sendPasswordResetEmail } from "@/lib/email";
import { applyRateLimit, getStringField } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";

const JWT_SECRET = process.env.PASSRESET_TOKEN_SECRET;

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body: unknown = await req.json();
        const emailIdentifier = getStringField(body, "email");
        const rateLimitResult = applyRateLimit({
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
        });

        // คืน 200 เสมอเพื่อป้องกัน user enumeration attack
        if (!user) {
            return NextResponse.json(
                { message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว" },
                { status: 200, headers: rateLimitResult.headers }
            );
        }

        if (!JWT_SECRET) {
            throw new Error(
                "SECRET is not defined in the environment variables."
            );
        }

        const token = jwt.sign({ userId: String(user.id) }, JWT_SECRET, {
            expiresIn: "1h",
        });

        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

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
