import { type NextRequest, NextResponse } from "next/server";
import { PAGINATION } from "@/lib/shared/constants";
import { requireAdminSession, isGuardError } from "@/lib/server/auth/guards";
import { parsePositiveInt } from "@/lib/shared/http/queryParams";
import { applyAdminMutationRateLimit } from "@/lib/server/rate-limit/adminMutationRateLimit";
import {
    getProjectReportsForAdmin,
    updateProjectReportStatusWithAudit,
} from "@/lib/services/projectReportService";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { updateProjectReportStatusSchema } from "@/lib/validation/schemas";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import { buildAuditContext } from "@/lib/api/requestContext";
import {
    publicErrorResponse,
    unauthorizedResponse,
    validationErrorResponse,
} from "@/lib/api/responses";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;

        const { searchParams } = new URL(req.url);
        const page = parsePositiveInt(searchParams.get("page"), 1);
        const limit = parsePositiveInt(
            searchParams.get("limit"),
            PAGINATION.ITEMS_PER_PAGE,
        );
        const search = searchParams.get("search") ?? undefined;
        const status = searchParams.get("status") ?? undefined;
        const projectId = parsePositiveIntId(searchParams.get("projectId"));
        const result = await getProjectReportsForAdmin({
            page,
            limit,
            search,
            status,
            projectId: projectId ?? undefined,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching admin reports:", error);
        return publicErrorResponse(error, "ไม่สามารถดึงรายงานได้");
    }
}

export async function PATCH(req: Request): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await readJsonBody(req);
        const parsed = updateProjectReportStatusSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;
        const { session } = guard;
        const reviewedBy = parsePositiveIntId(session.user.id);
        if (reviewedBy === null) {
            return unauthorizedResponse();
        }

        const report = await updateProjectReportStatusWithAudit({
            reportId: parsed.data.reportId,
            status: parsed.data.status,
            adminNote: parsed.data.adminNote,
            reviewedBy,
            audit: buildAuditContext(session, req),
        });

        return NextResponse.json({
            success: true,
            message: "อัปเดตผลตรวจรายงานสำเร็จ",
            report,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "PROJECT_REPORT_ALREADY_REVIEWED"
        ) {
            return NextResponse.json(
                { error: "รายงานนี้ถูกตรวจแล้ว ไม่สามารถอัปเดตซ้ำได้" },
                { status: 409 },
            );
        }

        console.error("Error updating admin report:", error);
        return publicErrorResponse(error, "ไม่สามารถอัปเดตรายงานได้");
    }
}
