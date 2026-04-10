// app/api/auth/reset-password/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt, { type JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { applyRateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";

const RESET_TOKEN_SECRET =
    process.env.PASSRESET_TOKEN_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;

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

        if (!RESET_TOKEN_SECRET) {
            throw new Error(
                "SECRET is not defined in the environment variables."
            );
        }

        let decodedToken: JwtPayload;
        try {
            decodedToken = jwt.verify(token, RESET_TOKEN_SECRET) as JwtPayload;
        } catch (err) {
            console.error("Token verification failed:", err);
            return NextResponse.json(
                { error: "ลิงก์หมดอายุหรือไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        if (typeof decodedToken !== "object" || !decodedToken.userId) {
            return NextResponse.json(
                { error: "โทเค็นไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: Number(decodedToken.userId),
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "ไม่พบผู้ใช้งาน" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
            },
        });

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
