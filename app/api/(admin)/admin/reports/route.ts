import { type NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/auditLog";
import { PAGINATION } from "@/lib/constants";
import { toPublicApiError } from "@/lib/apiError";
import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";
import { parsePositiveInt } from "@/lib/queryParams";
import {
    getProjectReportsForAdmin,
    updateProjectReportStatus,
} from "@/lib/services";
import { parsePositiveIntId } from "@/lib/id";
import { updateProjectReportStatusSchema } from "@/lib/validation/schemas";

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
        const mappedError = toPublicApiError(error, "ไม่สามารถดึงรายงานได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}

export async function PATCH(req: Request): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;
        const { session } = guard;
        const reviewedBy = parsePositiveIntId(session.user.id);
        if (reviewedBy === null) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 },
            );
        }

        const body: unknown = await req.json();
        const parsed = updateProjectReportStatusSchema.safeParse(body);
        if (!parsed.success) {
            const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const report = await updateProjectReportStatus({
            reportId: parsed.data.reportId,
            status: parsed.data.status,
            adminNote: parsed.data.adminNote,
            reviewedBy,
        });

        logAudit("ADMIN_PROJECT_REPORT_UPDATE", session.user.id, {
            userEmail: session.user.email ?? undefined,
            details: {
                reportId: report.id,
                projectId: report.projectId,
                projectName: report.projectName,
                status: report.status,
                userEmail: report.userEmail,
            },
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
        const mappedError = toPublicApiError(error, "ไม่สามารถอัปเดตรายงานได้");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
