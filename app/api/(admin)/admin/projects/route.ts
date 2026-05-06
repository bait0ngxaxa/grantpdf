import { type NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/auditLog";
import {
    getAllProjectsPaginated,
    updateProjectStatus,
    programExistsById,
} from "@/lib/services";
import { PAGINATION } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/queryParams";
import { updateAdminProjectSchema } from "@/lib/validation/schemas";
import { toPublicApiError } from "@/lib/apiError";
import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";

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
        const fileType = searchParams.get("fileType") ?? undefined;
        const sortBy = searchParams.get("sortBy") ?? undefined;

        const result = await getAllProjectsPaginated({ page, limit, search, status, fileType, sortBy });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching admin projects:", error);
        const mappedError = toPublicApiError(error, "Failed to fetch projects");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}

export async function PUT(req: Request): Promise<NextResponse> {
    try {
        const guard = await requireAdminSession();
        if (isGuardError(guard)) return guard;
        const { session } = guard;

        const body: unknown = await req.json();
        const parsed = updateAdminProjectSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { projectId, status, statusNote, programId } = parsed.data;

        if (programId !== undefined && programId !== null) {
            const validProgram = await programExistsById(programId);
            if (!validProgram) {
                return NextResponse.json(
                    { error: "โครงการหลักที่เลือกไม่ถูกต้อง" },
                    { status: 400 },
                );
            }
        }

        const updatedProject = await updateProjectStatus({
            projectId,
            status,
            statusNote,
            programId,
        });

        logAudit("ADMIN_PROJECT_UPDATE", session.user.id, {
            userEmail: session.user.email || undefined,
            details: {
                projectId: updatedProject.id,
                projectName: updatedProject.name,
                newStatus: status,
                statusNote: statusNote || null,
                programId: updatedProject.programId ?? null,
                programName: updatedProject.programName ?? null,
                projectOwnerEmail: updatedProject.userEmail,
            },
        });

        return NextResponse.json({
            success: true,
            project: updatedProject,
            message: `อัปเดตสถานะโครงการเป็น "${status}" สำเร็จ`,
        });
    } catch (error) {
        console.error("Error updating project status:", error);

        if (error instanceof Error && error.message.includes("Invalid")) {
            return NextResponse.json(
                { error: "ข้อมูลสำหรับอัปเดตสถานะไม่ถูกต้อง" },
                { status: 400 },
            );
        }

        const mappedError = toPublicApiError(error, "Failed to update project status");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
