import { type NextRequest, NextResponse } from "next/server";
import {
    getAllProjectsPaginated,
    updateProjectStatusWithAudit,
} from "@/lib/services/projectService";
import { programExistsById } from "@/lib/services/programService";
import { PAGINATION } from "@/lib/shared/constants";
import { parsePositiveInt } from "@/lib/shared/http/queryParams";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import { updateAdminProjectSchema } from "@/lib/validation/schemas";
import { requireAdminSession, isGuardError } from "@/lib/server/auth/guards";
import { applyAdminMutationRateLimit } from "@/lib/server/rate-limit/adminMutationRateLimit";
import { readJsonBody, getFirstValidationMessage } from "@/lib/api/body";
import { buildAuditContext } from "@/lib/api/requestContext";
import {
    publicErrorResponse,
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
        const safeLimit = Math.min(
            limit,
            PAGINATION.ADMIN_PROJECTS_API_PAGE_LIMIT,
        );
        const search = searchParams.get("search") ?? undefined;
        const status = searchParams.get("status") ?? undefined;
        const fileType = searchParams.get("fileType") ?? undefined;
        const programId = parsePositiveIntId(searchParams.get("programId"));
        const sortBy = searchParams.get("sortBy") ?? undefined;

        const result = await getAllProjectsPaginated({
            page,
            limit: safeLimit,
            programId: programId ?? undefined,
            search,
            status,
            fileType,
            sortBy,
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching admin projects:", error);
        return publicErrorResponse(error, "Failed to fetch projects");
    }
}

export async function PUT(req: Request): Promise<NextResponse> {
    try {
        const rateLimitResponse = await applyAdminMutationRateLimit(req);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await readJsonBody(req);
        const parsed = updateAdminProjectSchema.safeParse(body);
        if (!parsed.success) {
            return validationErrorResponse(
                getFirstValidationMessage(parsed.error),
            );
        }

        const { projectId, status, statusNote, programId } = parsed.data;
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;
        const { session } = guard;

        if (programId !== undefined && programId !== null) {
            const validProgram = await programExistsById(programId);
            if (!validProgram) {
                return NextResponse.json(
                    { error: "โครงการหลักที่เลือกไม่ถูกต้อง" },
                    { status: 400 },
                );
            }
        }

        const updatedProject = await updateProjectStatusWithAudit(
            {
                projectId,
                status,
                statusNote,
                programId,
            },
            buildAuditContext(session, req),
        );

        return NextResponse.json({
            success: true,
            project: updatedProject,
            message: `อัปเดตสถานะโครงการเป็น "${status}" สำเร็จ`,
        });
    } catch (error) {
        console.error("Error updating project status:", error);

        if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
            return NextResponse.json(
                { error: "ไม่พบโครงการ" },
                { status: 404 },
            );
        }

        if (error instanceof Error && error.message.includes("Invalid")) {
            return NextResponse.json(
                { error: "ข้อมูลสำหรับอัปเดตสถานะไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        return publicErrorResponse(error, "Failed to update project status");
    }
}
