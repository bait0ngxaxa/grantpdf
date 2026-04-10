// app/api/auth/forgot-password/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { sendPasswordResetEmail } from "@/lib/email";
import { applyRateLimit, getStringField } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";

const RESET_TOKEN_SECRET =
    process.env.PASSRESET_TOKEN_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;

function normalizeBaseUrl(value: string | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") {
        return null;
    }

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null;
        }
        return parsed.origin;
    } catch {
        return null;
    }
}

function resolveBaseUrl(req: NextRequest): string {
    const envBaseUrl =
        normalizeBaseUrl(process.env.AUTH_URL) ??
        normalizeBaseUrl(process.env.NEXTAUTH_URL);
    if (envBaseUrl) {
        return envBaseUrl;
    }

    const forwardedHost = req.headers.get("x-forwarded-host");
    const host = forwardedHost ?? req.headers.get("host");
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const proto =
        forwardedProto?.split(",")[0].trim() ??
        (req.nextUrl.protocol === "https:" ? "https" : "http");

    if (host) {
        return `${proto}://${host}`;
    }

    return req.nextUrl.origin;
}

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

        if (!RESET_TOKEN_SECRET) {
            throw new Error(
                "SECRET is not defined in the environment variables."
            );
        }

        const token = jwt.sign({ userId: String(user.id) }, RESET_TOKEN_SECRET, {
            expiresIn: "1h",
        });

        const resetUrl = new URL("/reset-password", resolveBaseUrl(req));
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
