import type { Session } from "@/lib/server/auth/types";
import { readClientIp } from "@/lib/shared/request/clientIp";

export interface AuditRequestContext {
    actorUserId: string;
    actorEmail?: string;
    ip?: string;
    userAgent?: string;
    requestId?: string;
}

export function getClientIp(request: Request): string | undefined {
    return readClientIp(request);
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
