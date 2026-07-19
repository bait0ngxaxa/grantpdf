import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db";
import { parsePositiveIntId } from "@/lib/shared/http/id";
import {
    findProjectByIdAndUser,
    findProjectByNameAndUser,
    createProject,
} from "@/lib/services/projectService";
import type { ProjectResult } from "./types";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { notifyProjectDocumentUploaded } from "@/lib/services/notificationEventService";

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
): Promise<ProjectResult | NextResponse> {
    let project;

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
            };
        }
    }

    return {
        id: project.id,
        name: project.name,
        description: project.description,
    };
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
    userId: number,
    projectId: number,
    originalFileName: string,
    storagePath: string,
    extension: string = "docx",
    transaction?: Prisma.TransactionClient,
): Promise<{ id: number }> {
    const trimmedFileName = originalFileName.trim();
    const normalizedExtension = extension.trim().replace(/^\./, "").toLowerCase();

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
        const createdFile = await tx.userFile.create({
            data: {
                originalFileName: fileNameWithExt,
                storagePath,
                fileExtension: normalizedExtension,
                userId,
                projectId,
            },
        });
        await notifyProjectDocumentUploaded(tx, {
            fileId: createdFile.id,
            projectId,
            fileName: createdFile.originalFileName,
            actorUserId: userId,
        });
        return createdFile;
    };

    if (transaction) return persist(transaction);

    const userFile = await prisma.$transaction(persist);
    await invalidateDashboardStats([userId]);
    return userFile;
}
