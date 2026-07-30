import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import {
    findProjectByIdAndUser,
    findProjectByNameAndUser,
    createProject,
} from "@/lib/services/projectService";
import type { ProjectResolution, ProjectResolutionOrigin } from "./types";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { notifyProjectDocumentUploaded } from "@/lib/services/notificationEventService";
import { reserveStorageQuota } from "@/lib/services/storageQuotaService";

interface CreateUserFileRecordInput {
    userId: number;
    projectId: number;
    originalFileName: string;
    storagePath: string;
    fileSize: number;
    extension?: string;
    transaction?: Prisma.TransactionClient;
}

/**
 * Find or create a project for document generation.
 * Uses shared projectService queries and mutations to reduce duplication.
 */
export async function findOrCreateProject(
    userId: number,
    projectName: string,
    projectIdFromForm: string | null,
    programId: number | null,
    documentTypeDescription: string,
): Promise<ProjectResolution | NextResponse> {
    let project: {
        id: number;
        name: string;
        description: string | null;
        programId: number | null;
    } | null = null;
    let origin: ProjectResolutionOrigin = "existing";
    let previousDeletedAt: Date | null = null;

    if (projectIdFromForm) {
        // Find existing project by ID
        const projectId = parsePositiveIntId(projectIdFromForm);
        if (projectId === null) {
            return NextResponse.json(
                { error: "รหัสโครงการไม่ถูกต้อง กรุณาเลือกโครงการอีกครั้ง" },
                { status: 400 },
            );
        }

        project = await findProjectByIdAndUser(
            projectId,
            userId,
        );

        if (!project) {
            return NextResponse.json(
                { error: "ไม่พบโครงการหรือคุณไม่มีสิทธิ์เข้าถึงโครงการนี้" },
                { status: 400 },
            );
        }

        if (project.programId === null) {
            return NextResponse.json(
                {
                    error: "โครงการนี้ยังไม่ได้กำหนดโครงการหลัก กรุณาให้ผู้ดูแลระบบกำหนดก่อนสร้างเอกสาร",
                },
                { status: 400 },
            );
        }
    } else {
        if (programId === null) {
            return NextResponse.json(
                { error: "กรุณาเลือกโครงการหลักก่อนสร้างเอกสาร" },
                { status: 400 },
            );
        }

        // Find or create project by name
        project = await findProjectByNameAndUser(projectName, userId);

        if (project?.programId === null) {
            return NextResponse.json(
                {
                    error: "โครงการนี้ยังไม่ได้กำหนดโครงการหลัก กรุณาให้ผู้ดูแลระบบกำหนดก่อนสร้างเอกสาร",
                },
                { status: 400 },
            );
        }

        if (!project) {
            const newProject = await createProject(
                userId,
                projectName,
                `${projectName} - ${documentTypeDescription}`,
                programId,
            );
            project = {
                id: parseInt(newProject.id),
                name: newProject.name,
                description: newProject.description,
                programId: newProject.programId,
            };
            origin = newProject.origin;
            previousDeletedAt = newProject.previousDeletedAt;
        }
    }

    if (!project) {
        throw new Error("DOCUMENT_PROJECT_NOT_FOUND");
    }

    return {
        project: {
            id: project.id,
            name: project.name,
            description: project.description,
        },
        origin,
        previousDeletedAt,
    };
}

function getProjectCompensationWhere(
    resolution: ProjectResolution,
    userId: number,
) {
    return {
        id: resolution.project.id,
        userId,
        deletedAt: null,
        files: { none: {} },
        reports: { none: {} },
        coOwners: { none: {} },
    };
}

async function deleteCreatedProject(
    tx: Prisma.TransactionClient,
    resolution: ProjectResolution,
    userId: number,
): Promise<boolean> {
    const notificationEvents = await tx.notificationEvent.findMany({
        where: { projectId: resolution.project.id },
        select: { id: true },
    });
    const result = await tx.project.deleteMany({
        where: getProjectCompensationWhere(resolution, userId),
    });

    if (result.count !== 1) return false;

    if (notificationEvents.length > 0) {
        await tx.notificationEvent.deleteMany({
            where: {
                id: {
                    in: notificationEvents.map((event) => event.id),
                },
            },
        });
    }

    return true;
}

async function restoreProject(
    tx: Prisma.TransactionClient,
    resolution: ProjectResolution,
    userId: number,
): Promise<boolean> {
    if (resolution.previousDeletedAt === null) {
        throw new Error("DOCUMENT_PROJECT_RESTORE_STATE_MISSING");
    }

    const result = await tx.project.updateMany({
        where: getProjectCompensationWhere(resolution, userId),
        data: {
            deletedAt: resolution.previousDeletedAt,
            updated_at: new Date(),
        },
    });

    return result.count === 1;
}

export async function compensateCreatedProject(
    resolution: ProjectResolution,
    userId: number,
): Promise<void> {
    if (resolution.origin === "existing") return;

    try {
        const compensated = await prisma.$transaction(async (tx) => {
            if (resolution.origin === "created") {
                return deleteCreatedProject(tx, resolution, userId);
            }

            return restoreProject(tx, resolution, userId);
        });

        if (compensated) await invalidateDashboardStats([userId]);
    } catch (error: unknown) {
        console.error("Failed to compensate document project creation:", {
            projectId: resolution.project.id,
            userId,
            error,
        });
    }
}

export async function withDocumentProjectCompensation<T>(
    resolution: ProjectResolution,
    userId: number,
    operation: () => Promise<T>,
): Promise<T> {
    try {
        return await operation();
    } catch (error: unknown) {
        await compensateCreatedProject(resolution, userId);
        throw error;
    }
}

export function readProgramIdFromForm(formData: FormData): number | null {
    const rawProgramId = formData.get("programId");
    if (typeof rawProgramId !== "string" || rawProgramId.trim() === "") {
        return null;
    }

    return parsePositiveIntId(rawProgramId);
}

/**
 * Create UserFile record in database.
 */
export async function createUserFileRecord(
    input: CreateUserFileRecordInput,
): Promise<{ id: number }> {
    const trimmedFileName = input.originalFileName.trim();
    const normalizedExtension = (input.extension ?? "docx")
        .trim()
        .replace(/^\./, "")
        .toLowerCase();

    if (!trimmedFileName) {
        throw new Error("DOCUMENT_FILE_NAME_REQUIRED");
    }

    if (!/^[a-z0-9]+$/.test(normalizedExtension)) {
        throw new Error("DOCUMENT_EXTENSION_INVALID");
    }

    const fileNameWithExt = trimmedFileName
        .toLowerCase()
        .endsWith(`.${normalizedExtension}`)
        ? trimmedFileName
        : `${trimmedFileName}.${normalizedExtension}`;

    const persist = async (
        tx: Prisma.TransactionClient,
    ): Promise<{ id: number }> => {
        const hasStorageQuota = await reserveStorageQuota(
            input.userId,
            input.fileSize,
            tx,
        );
        if (!hasStorageQuota) {
            throw new Error("STORAGE_QUOTA_EXCEEDED");
        }

        const createdFile = await tx.userFile.create({
            data: {
                originalFileName: fileNameWithExt,
                storagePath: input.storagePath,
                fileExtension: normalizedExtension,
                fileSize: BigInt(input.fileSize),
                userId: input.userId,
                projectId: input.projectId,
            },
        });
        await notifyProjectDocumentUploaded(tx, {
            fileId: createdFile.id,
            projectId: input.projectId,
            fileName: createdFile.originalFileName,
            actorUserId: input.userId,
        });
        return createdFile;
    };

    if (input.transaction) return persist(input.transaction);

    const userFile = await prisma.$transaction(persist);
    await invalidateDashboardStats([input.userId]);
    return userFile;
}
