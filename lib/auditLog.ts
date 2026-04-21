import { parseActorUserId, toPrismaJsonValue } from "@/lib/auditUtils";
import { prisma } from "@/lib/prisma";

const TIMEZONE = "Asia/Bangkok"; // Thailand UTC+7

function formatThailandTimestamp(): string {
    const now = new Date();
    return (
        now.toLocaleString("sv-SE", { timeZone: TIMEZONE }).replace(" ", "T") +
        "+07:00"
    );
}

export type AuditAction =
    // Authentication
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "LOGOUT"
    | "SIGNUP"
    | "PASSWORD_RESET_REQUEST"
    | "PASSWORD_RESET_SUCCESS"
    // File operations (User)
    | "FILE_UPLOAD"
    | "FILE_DOWNLOAD"
    | "FILE_DELETE"
    // Project operations
    | "PROJECT_CREATE"
    | "PROJECT_UPDATE"
    | "PROJECT_DELETE"
    | "DOCUMENT_GENERATE"
    // Admin operations
    | "ADMIN_USER_DELETE"
    | "ADMIN_USER_UPDATE"
    | "ADMIN_PROJECT_UPDATE"
    | "ADMIN_FILE_DOWNLOAD";

export type AuditOutcome = "success" | "failure";

export interface AuditLogEntry {
    timestamp: string;
    action: AuditAction;
    outcome: AuditOutcome;
    userId: string | null;
    userEmail?: string;
    targetType?: string;
    targetId?: string;
    requestId?: string;
    userAgent?: string;
    ip?: string;
    details?: Record<string, unknown>;
}

interface AuditLogOptions {
    userEmail?: string;
    ip?: string;
    details?: Record<string, unknown>;
    outcome?: AuditOutcome;
    targetType?: string;
    targetId?: string;
    requestId?: string;
    userAgent?: string;
}

function inferOutcome(action: AuditAction, outcome?: AuditOutcome): AuditOutcome {
    if (outcome) return outcome;
    return action.endsWith("_FAILED") ? "failure" : "success";
}

async function writeAuditLogToDatabase(entry: AuditLogEntry): Promise<void> {
    await prisma.auditLog.create({
        data: {
            action: entry.action,
            outcome: entry.outcome,
            actorUserId: parseActorUserId(entry.userId),
            actorEmail: entry.userEmail,
            targetType: entry.targetType,
            targetId: entry.targetId,
            ip: entry.ip,
            userAgent: entry.userAgent,
            requestId: entry.requestId,
            details: toPrismaJsonValue(entry.details),
            created_at: new Date(entry.timestamp),
        },
    });
}

/**
 * Log an audit entry to database (non-blocking)
 * @param action - The action being logged
 * @param userId - The user performing the action (null for anonymous)
 * @param options - Additional options
 */
export function logAudit(
    action: AuditAction,
    userId: string | null,
    options?: AuditLogOptions,
): void {
    const entry: AuditLogEntry = {
        timestamp: formatThailandTimestamp(),
        action,
        outcome: inferOutcome(action, options?.outcome),
        userId,
        userEmail: options?.userEmail,
        targetType: options?.targetType,
        targetId: options?.targetId,
        requestId: options?.requestId,
        userAgent: options?.userAgent,
        ip: options?.ip,
        details: options?.details,
    };

    // Non-blocking write: don't hold request-response cycle for audit logging.
    void (async () => {
        try {
            await writeAuditLogToDatabase(entry);
        } catch (error) {
            // Silent fail - don't break the app if logging fails
            console.error("Audit log error:", error);
        }
    })();
}
