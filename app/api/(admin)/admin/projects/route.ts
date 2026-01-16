import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/auditLog";
import { getAllProjects, updateProjectStatus } from "@/lib/services";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await getAllProjects();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching admin projects:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
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
            { status: 500 }
        );
    }
}
