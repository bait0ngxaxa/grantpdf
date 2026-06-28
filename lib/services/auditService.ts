import { prisma } from "@/lib/server/db";
import { purgeExpiredAuditLogs } from "@/lib/services/auditRetentionService";
import type { Prisma } from "@prisma/client";
import type { AuditLogsApiResponse, AuditLogApiData } from "@/type/api";

export interface GetAuditLogsParams {
    page: number;
    limit: number;
    date?: string;
    action?: string;
    outcome?: "success" | "failure";
    actorUserId?: number;
    targetType?: string;
    targetId?: string;
    search?: string;
}

function toRecord(value: Prisma.JsonValue | null): Record<string, unknown> | null {
    if (!value || Array.isArray(value) || typeof value !== "object") {
        return null;
    }
    return value as Record<string, unknown>;
}

function toStartOfDay(dateString: string): Date {
    return new Date(`${dateString}T00:00:00.000+07:00`);
}

function toEndOfDay(dateString: string): Date {
    return new Date(`${dateString}T23:59:59.999+07:00`);
}

function toWhereClause(params: GetAuditLogsParams): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {};

    if (params.date) {
        where.created_at = {
            gte: toStartOfDay(params.date),
            lte: toEndOfDay(params.date),
        };
    }

    if (params.action) {
        where.action = params.action;
    }

    if (params.outcome) {
        where.outcome = params.outcome;
    }

    if (params.actorUserId) {
        where.actorUserId = params.actorUserId;
    }

    if (params.targetType) {
        where.targetType = params.targetType;
    }

    if (params.targetId) {
        where.targetId = { contains: params.targetId };
    }

    if (params.search) {
        where.OR = [
            { action: { contains: params.search } },
            { actorEmail: { contains: params.search } },
            { targetId: { contains: params.search } },
            { requestId: { contains: params.search } },
        ];
    }

    return where;
}

function mapAuditRowToApiData(row: {
    id: bigint;
    action: string;
    outcome: string;
    actorUserId: number | null;
    actorEmail: string | null;
    targetType: string | null;
    targetId: string | null;
    ip: string | null;
    userAgent: string | null;
    requestId: string | null;
    details: Prisma.JsonValue | null;
    created_at: Date;
}): AuditLogApiData {
    return {
        id: row.id.toString(),
        action: row.action,
        outcome: row.outcome === "failure" ? "failure" : "success",
        actorUserId: row.actorUserId?.toString() ?? null,
        actorEmail: row.actorEmail,
        targetType: row.targetType,
        targetId: row.targetId,
        ip: row.ip,
        userAgent: row.userAgent,
        requestId: row.requestId,
        details: toRecord(row.details),
        created_at: row.created_at.toISOString(),
    };
}

export async function getAuditLogsPaginated(
    params: GetAuditLogsParams,
): Promise<AuditLogsApiResponse> {
    const skip = (params.page - 1) * params.limit;
    const where = toWhereClause(params);

    await purgeExpiredAuditLogs();

    const [total, rows] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
            where,
            orderBy: { created_at: "desc" },
            skip,
            take: params.limit,
            select: {
                id: true,
                action: true,
                outcome: true,
                actorUserId: true,
                actorEmail: true,
                targetType: true,
                targetId: true,
                ip: true,
                userAgent: true,
                requestId: true,
                details: true,
                created_at: true,
            },
        }),
    ]);

    return {
        logs: rows.map(mapAuditRowToApiData),
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
    };
}
