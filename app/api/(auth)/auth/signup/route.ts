// /app/api/auth/signup/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { applyRateLimit, getClientIP } from "@/lib/server/rate-limit/rateLimit";
import { logAudit } from "@/lib/server/audit/auditLog";
import { signupSchema } from "@/lib/validation/schemas";
import { RATE_LIMIT } from "@/lib/shared/constants";
import { getStringField } from "@/lib/shared/utils";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
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
            routeKey: RATE_LIMIT.AUTH.SIGNUP.ROUTE_KEY,
            limit: RATE_LIMIT.AUTH.SIGNUP.LIMIT,
            windowMs: RATE_LIMIT.AUTH.SIGNUP.WINDOW_MS,
            identifier: emailIdentifier,
        });

        if (!rateLimitResult.success) {
            return rateLimitExceededResponse(
                rateLimitResult,
                "มีการร้องขอมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
            );
        }

        const parsed = signupSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const { name, email, password } = parsed.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "อีเมลนี้ถูกใช้ไปแล้ว" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        await invalidateDashboardStats([]);

        // Log successful signup
        logAudit("SIGNUP", String(newUser.id), {
            userEmail: newUser.email,
            ip,
        });

        return NextResponse.json(
            {
                message: "สมัครสมาชิกสำเร็จ",
                data: {
                    user: {
                        id: newUser.id.toString(),
                        name: newUser.name,
                        email: newUser.email,
                    },
                },
            },
            {
                status: 201,
                headers: rateLimitResult.headers,
            }
        );
    } catch (e) {
        console.error("Error creating user:", e);

        if (e instanceof PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                const target = (e.meta?.target as string[])?.[0];
                if (target === "email") {
                    return NextResponse.json(
                        { error: "อีเมลนี้ถูกใช้ไปแล้ว" },
                        { status: 409 }
                    );
                }
            }
        }

        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
            { status: 500 }
        );
    }
}
