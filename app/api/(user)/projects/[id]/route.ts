import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateProjectSchema } from "@/lib/validation/schemas";
import { parsePositiveIntId } from "@/lib/id";
import { publicApiError, toPublicApiError } from "@/lib/apiError";

// PUT: อัพเดตโครงการ
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const projectId = parsePositiveIntId(resolvedParams.id);
        if (projectId === null) {
            throw publicApiError(400, "รหัสโครงการไม่ถูกต้อง");
        }

        const body: unknown = await req.json();
        const parsed = updateProjectSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }
        const { name, description } = parsed.data;

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "Unauthorized");
        }

        // ตรวจสอบว่าโครงการเป็นของผู้ใช้หรือไม่
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
            },
        });

        if (!existingProject) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        const updatedProject = await prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                name,
                description:
                    description && description.trim() !== "" ? description : null,
            },
            include: {
                files: true,
                _count: {
                    select: { files: true },
                },
            },
        });

        return NextResponse.json({
            ...updatedProject,
            id: updatedProject.id.toString(),
        });
    } catch (error) {
        console.error("Error updating project:", error);
        const mappedError = toPublicApiError(error, "Failed to update project");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}

// DELETE: ลบโครงการ
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const projectId = parsePositiveIntId(resolvedParams.id);
        if (projectId === null) {
            throw publicApiError(400, "รหัสโครงการไม่ถูกต้อง");
        }

        const userId = parsePositiveIntId(session.user.id);
        if (userId === null) {
            throw publicApiError(401, "Unauthorized");
        }

        // ตรวจสอบว่าโครงการเป็นของผู้ใช้หรือไม่
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
            },
        });

        if (!existingProject) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // ลบโครงการ (จะลบไฟล์ที่เกี่ยวข้องด้วยเนื่องจาก onDelete: Cascade ใน schema)
        await prisma.project.delete({
            where: {
                id: projectId,
            },
        });

        return NextResponse.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        const mappedError = toPublicApiError(error, "Failed to delete project");
        return NextResponse.json(
            { error: mappedError.publicMessage },
            { status: mappedError.status }
        );
    }
}
