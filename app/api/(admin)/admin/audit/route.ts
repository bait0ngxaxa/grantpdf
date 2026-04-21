import { type NextRequest, NextResponse } from "next/server";
import { getAuditLogsPaginated } from "@/lib/services";
import { parseActorUserId } from "@/lib/auditUtils";
import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";
import { parsePositiveInt } from "@/lib/queryParams";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function normalizeLimit(value: number): number {
    return Math.min(value, MAX_LIMIT);
}

function parseOutcome(
    value: string | null,
): "success" | "failure" | undefined {
    if (value === "success" || value === "failure") return value;
    return undefined;
}

function parseDate(value: string | null): string | undefined {
    if (!value) return undefined;
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
    return isValidDate ? value : undefined;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const { searchParams } = new URL(req.url);
        const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
        const limit = normalizeLimit(
            parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT),
        );
        const date = parseDate(searchParams.get("date"));
        const action = searchParams.get("action") ?? undefined;
        const outcome = parseOutcome(searchParams.get("outcome"));
        const actorUserId = parseActorUserId(
            searchParams.get("actorUserId"),
        ) ?? undefined;
        const targetType = searchParams.get("targetType") ?? undefined;
        const targetId = searchParams.get("targetId") ?? undefined;
        const search = searchParams.get("search") ?? undefined;

        const result = await getAuditLogsPaginated({
            page,
            limit,
            date,
            action,
            outcome,
            actorUserId,
            targetType,
            targetId,
            search,
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการดึงข้อมูล Audit Logs" },
            { status: 500 },
        );
    }
}
