import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RATE_LIMIT } from "@/lib/shared/constants";
import {
    isGuardError,
    requireSessionFamily,
    type SessionFamilyGuardSuccess,
} from "@/lib/server/auth/guards";
import { logAudit } from "@/lib/server/audit/auditLog";
import {
    getUserDeviceSessions,
    revokeUserSessionFamily,
} from "@/lib/services/deviceSessionService";
import { applyRateLimit, getClientIP } from "@/lib/server/rate-limit/rateLimit";
import { readJsonBody } from "@/lib/api/body";
import {
    rateLimitExceededResponse,
    validationErrorResponse,
} from "@/lib/api/responses";
import { getUserAgent } from "@/lib/api/requestContext";

const revokeSessionSchema = z.object({
    sessionFamilyId: z.string().min(16).max(128),
});

function buildDeviceSessionContext(guard: SessionFamilyGuardSuccess): {
    userId: number;
    currentFamilyId: string;
    sessionVersion: number;
    email?: string | null;
} {
    return {
        userId: guard.userId,
        currentFamilyId: guard.currentFamilyId,
        sessionVersion: guard.sessionVersion,
        email: guard.session.user.email,
    };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.SESSIONS.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.SESSIONS.LIMIT,
        windowMs: RATE_LIMIT.AUTH.SESSIONS.WINDOW_MS,
    });

    if (!rateLimitResult.success) {
        return rateLimitExceededResponse(
            rateLimitResult,
            "มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
        );
    }

    const guard = await requireSessionFamily();
    if (isGuardError(guard)) return guard;

    const sessions = await getUserDeviceSessions(buildDeviceSessionContext(guard));
    return NextResponse.json({ sessions }, { headers: rateLimitResult.headers });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await applyRateLimit({
        request: req,
        routeKey: RATE_LIMIT.AUTH.SESSIONS.ROUTE_KEY,
        limit: RATE_LIMIT.AUTH.SESSIONS.LIMIT,
        windowMs: RATE_LIMIT.AUTH.SESSIONS.WINDOW_MS,
    });

    if (!rateLimitResult.success) {
        return rateLimitExceededResponse(
            rateLimitResult,
            "มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง",
        );
    }

    const body = await readJsonBody(req);
    const parsed = revokeSessionSchema.safeParse(body);
    if (!parsed.success) {
        return validationErrorResponse(
            "ข้อมูลเซสชันไม่ถูกต้อง",
            rateLimitResult.headers,
        );
    }

    const guard = await requireSessionFamily();
    if (isGuardError(guard)) return guard;
    const context = buildDeviceSessionContext(guard);

    if (parsed.data.sessionFamilyId === context.currentFamilyId) {
        return NextResponse.json(
            { error: "ไม่สามารถออกจากระบบอุปกรณ์ปัจจุบันด้วยคำสั่งนี้" },
            { status: 400, headers: rateLimitResult.headers }
        );
    }

    const revokedCount = await revokeUserSessionFamily({
        userId: context.userId,
        familyId: parsed.data.sessionFamilyId,
    });

    logAudit("SESSION_REVOKE", String(context.userId), {
        userEmail: context.email ?? undefined,
        ip: getClientIP(req),
        userAgent: getUserAgent(req),
        targetType: "authSession",
        targetId: parsed.data.sessionFamilyId,
        details: { revokedCount },
    });

    return NextResponse.json(
        { ok: true, revokedCount },
        { headers: rateLimitResult.headers }
    );
}
