import type { Session } from "@/lib/authTypes";

export interface AuditRequestContext {
    actorUserId: string;
    actorEmail?: string;
    ip?: string;
    userAgent?: string;
    requestId?: string;
}

export function getClientIp(request: Request): string | undefined {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0]?.trim() || undefined;
    }

    return (
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        undefined
    );
}

export function getRequestId(request: Request): string | undefined {
    return request.headers.get("x-request-id") || undefined;
}

export function getUserAgent(request: Request): string | undefined {
    return request.headers.get("user-agent") ?? undefined;
}

export function buildAuditContext(
    session: Session,
    request: Request,
): AuditRequestContext {
    return {
        actorUserId: session.user.id,
        actorEmail: session.user.email ?? undefined,
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
        requestId: getRequestId(request),
    };
}
