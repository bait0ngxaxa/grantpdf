import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/auditLog";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const projects = await prisma.project.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                files: {
                    include: {
                        attachmentFiles: {
                            select: {
                                id: true,
                                fileName: true,
                                filePath: true,
                                fileSize: true,
                                mimeType: true,
                            },
                        },
                    },
                    orderBy: { created_at: "desc" },
                },
                _count: {
                    select: { files: true },
                },
            },
            orderBy: { created_at: "desc" },
        });

        const orphanFiles = await prisma.userFile.findMany({
            where: {
                projectId: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                attachmentFiles: {
                    select: {
                        id: true,
                        fileName: true,
                        filePath: true,
                        fileSize: true,
                        mimeType: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });

        const sanitizedProjects = projects.map(
            (project: (typeof projects)[number]) => ({
                ...project,
                id: project.id.toString(),
                userId: project.userId.toString(),
                userName: project.user?.name || "Unknown User",
                userEmail: project.user?.email || "Unknown Email",
                files: project.files.map(
                    (file: (typeof project.files)[number]) => ({
                        ...file,
                        id: file.id.toString(),
                        userId: file.userId.toString(),
                        userName: project.user?.name || "Unknown User",
                        userEmail: project.user?.email || "Unknown Email",
                        attachmentFiles:
                            file.attachmentFiles?.map(
                                (
                                    attachment: NonNullable<
                                        typeof file.attachmentFiles
                                    >[number]
                                ) => ({
                                    ...attachment,
                                    id: attachment.id.toString(),
                                })
                            ) || [],
                    })
                ),
            })
        );

        const sanitizedOrphanFiles = orphanFiles.map(
            (file: (typeof orphanFiles)[number]) => ({
                ...file,
                id: file.id.toString(),
                userId: file.userId.toString(),
                userName: file.user?.name || "Unknown User",
                userEmail: file.user?.email || "Unknown Email",
                attachmentFiles:
                    file.attachmentFiles?.map(
                        (
                            attachment: NonNullable<
                                typeof file.attachmentFiles
                            >[number]
                        ) => ({
                            ...attachment,
                            id: attachment.id.toString(),
                        })
                    ) || [],
            })
        );

        // รวม filePath ของ attachment files ทั้งหมด เพื่อกรองไฟล์ที่เป็น attachment ออก
        const allAttachmentPaths = new Set<string>();

        // เก็บ filePath จาก project files
        for (const project of sanitizedProjects) {
            for (const file of project.files) {
                for (const att of file.attachmentFiles || []) {
                    allAttachmentPaths.add(att.filePath);
                }
            }
        }

        // เก็บ filePath จาก orphan files
        for (const file of sanitizedOrphanFiles) {
            for (const att of file.attachmentFiles || []) {
                allAttachmentPaths.add(att.filePath);
            }
        }

        // กรองไฟล์ที่ storagePath ตรงกับ attachment filePath ออก
        const filteredProjects = sanitizedProjects.map(
            (project: (typeof sanitizedProjects)[number]) => ({
                ...project,
                files: project.files.filter(
                    (file: (typeof project.files)[number]) =>
                        !allAttachmentPaths.has(file.storagePath)
                ),
            })
        );

        const filteredOrphanFiles = sanitizedOrphanFiles.filter(
            (file: (typeof sanitizedOrphanFiles)[number]) =>
                !allAttachmentPaths.has(file.storagePath)
        );

        return NextResponse.json({
            projects: filteredProjects,
            orphanFiles: filteredOrphanFiles,
        });
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

        const validStatuses = [
            "กำลังดำเนินการ",
            "อนุมัติ",
            "ไม่อนุมัติ",
            "แก้ไข",
            "ปิดโครงการ",
        ];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                {
                    error:
                        "Invalid status. Must be one of: " +
                        validStatuses.join(", "),
                },
                { status: 400 }
            );
        }

        const updatedProject = await prisma.project.update({
            where: {
                id: parseInt(projectId),
            },
            data: {
                status: status,
                statusNote: statusNote || null,
                updated_at: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: { files: true },
                },
            },
        });

        const sanitizedProject = {
            ...updatedProject,
            id: updatedProject.id.toString(),
            userId: updatedProject.userId.toString(),
            userName: updatedProject.user?.name || "Unknown User",
            userEmail: updatedProject.user?.email || "Unknown Email",
        };

        // Log admin project status update
        logAudit("ADMIN_PROJECT_UPDATE", session.user.id, {
            userEmail: session.user.email || undefined,
            details: {
                projectId: updatedProject.id.toString(),
                projectName: updatedProject.name,
                newStatus: status,
                statusNote: statusNote || null,
                projectOwnerEmail: updatedProject.user?.email,
            },
        });

        return NextResponse.json({
            success: true,
            project: sanitizedProject,
            message: `อัปเดตสถานะโครงการเป็น "${status}" สำเร็จ`,
        });
    } catch (error) {
        console.error("Error updating project status:", error);
        return NextResponse.json(
            { error: "Failed to update project status" },
            { status: 500 }
        );
    }
}
