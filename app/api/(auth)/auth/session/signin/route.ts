import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RATE_LIMIT, ROLES } from "@/lib/constants";
import { logAudit } from "@/lib/auditLog";
import {
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "@/lib/authSessionCookies";
import { createRefreshSession } from "@/lib/services";
import { signinSchema } from "@/lib/validation/schemas";
import {
    applyRateLimit,
    getClientIP,
} from "@/lib/ratelimit";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import {
    rateLimitExceededResponse,
    validationErrorResponse,
} from "@/lib/api/responses";
import { getUserAgent } from "@/lib/api/requestContext";

type SigninUser = {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    sessionVersion: number;
};

function buildInvalidCredentialsResponse(
    headers: Record<string, string>
): NextResponse {
    return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401, headers }
    );
}

async function findUserByEmail(email: string): Promise<SigninUser | null> {
    return prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            sessionVersion: true,
        },
    });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const body = await readJsonBody(req);
    const parsed = signinSchema.safeParse(body);
    if (!parsed.success) {
        return validationErrorResponse(
            getFirstValidationMessage(parsed.error),
        );
    }

    const { email, password } = parsed.data;
    const ip = getClientIP(req);
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.SIGNIN.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.SIGNIN.LIMIT,
        windowMs: RATE_LIMIT.AUTH.SIGNIN.WINDOW_MS,
        identifier: email,
    });

    if (!rateLimitResult.success) {
        logAudit("LOGIN_FAILED", null, {
            details: {
                attemptedEmail: email,
                reason: "rate_limited",
            },
            ip,
        });

        return rateLimitExceededResponse(
            {
                ...rateLimitResult,
                retryAfter: rateLimitResult.retryAfter ?? 1,
            },
            "มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
        );
    }

    const user = await findUserByEmail(email);
    const passwordMatches = user
        ? await bcrypt.compare(password, user.password)
        : false;

    if (!user || !passwordMatches) {
        logAudit("LOGIN_FAILED", null, {
            details: { attemptedEmail: email },
            ip,
        });

        return buildInvalidCredentialsResponse(rateLimitResult.headers);
    }

    const session = await createRefreshSession({
        userId: user.id,
        role: user.role || ROLES.MEMBER,
        sessionVersion: user.sessionVersion,
        ip,
        userAgent: getUserAgent(req),
    });

    logAudit("LOGIN_SUCCESS", String(user.id), {
        userEmail: user.email,
        ip,
    });

    const response = NextResponse.json(
        {
            user: {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role,
                sessionVersion: user.sessionVersion,
            },
            accessToken: session.accessToken,
            expiresAt: session.expiresAt.toISOString(),
        },
        { status: 200, headers: rateLimitResult.headers }
    );
    setAccessTokenCookie(response, session.accessToken);
    setRefreshTokenCookie(response, session.refreshToken);
    return response;
}
