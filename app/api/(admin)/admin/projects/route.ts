import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/auditLog";
import {
    getAllProjectsPaginated,
    updateProjectStatus,
    checkAdminPermission,
} from "@/lib/services";
import { PAGINATION } from "@/lib/constants";
import { parsePositiveInt } from "@/lib/queryParams";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

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
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 },
        );
    }
}

export async function PUT(req: Request): Promise<NextResponse> {
    try {
        const { isAdmin, session } = await checkAdminPermission();

        if (!isAdmin || !session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { projectId, status, statusNote } = await req.json();

        const updatedProject = await updateProjectStatus({
            projectId,
            status,
            statusNote,
        });

        // Log admin project status update
        logAudit("ADMIN_PROJECT_UPDATE", session.user.id, {
            userEmail: session.user.email || undefined,
            details: {
                projectId: updatedProject.id,
                projectName: updatedProject.name,
                newStatus: status,
                statusNote: statusNote || null,
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

        if (
            error instanceof Error &&
            error.message.includes("Invalid status")
        ) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Failed to update project status" },
            { status: 500 },
        );
    }
}
