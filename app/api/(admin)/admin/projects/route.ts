import { type NextRequest, NextResponse } from "next/server";
import {
    getAllProjectsPaginated,
    updateProjectStatusWithAudit,
    programExistsById,
} from "@/lib/services";
import { PAGINATION } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/queryParams";
import { updateAdminProjectSchema } from "@/lib/validation/schemas";
import { toPublicApiError } from "@/lib/apiError";
import { requireAdminSession, isGuardError } from "@/lib/auth-helpers";

function getClientIp(req: Request): string | undefined {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        undefined
    );
}

function getRequestId(req: Request): string | undefined {
    return req.headers.get("x-request-id") || undefined;
}

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

        const updatedProject = await updateProjectStatusWithAudit(
            {
                projectId,
                status,
                statusNote,
                programId,
            },
            {
                actorUserId: session.user.id,
                actorEmail: session.user.email || undefined,
                ip: getClientIp(req),
                userAgent: req.headers.get("user-agent") ?? undefined,
                requestId: getRequestId(req),
            },
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

        const mappedError = toPublicApiError(error, "Failed to update project status");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status },
        );
    }
}
