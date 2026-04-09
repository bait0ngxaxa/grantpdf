import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePositiveIntId } from "@/lib/id";
import {
    findProjectByIdAndUser,
    findProjectByNameAndUser,
    createProject,
} from "@/lib/services/projectService";
import type { ProjectResult } from "./types";

/**
 * Find or create a project for document generation.
 * Uses shared projectService queries and mutations to reduce duplication.
 */
export async function findOrCreateProject(
    userId: number,
    projectName: string,
    projectIdFromForm: string | null,
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
    } else {
        // Find or create project by name
        project = await findProjectByNameAndUser(projectName, userId);

        if (!project) {
            const newProject = await createProject(
                userId,
                projectName,
                `${projectName} - ${documentTypeDescription}`,
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

/**
 * Create UserFile record in database.
 */
export async function createUserFileRecord(
    userId: number,
    projectId: number,
    originalFileName: string,
    storagePath: string,
    extension: string = "docx",
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

    return await prisma.userFile.create({
        data: {
            originalFileName: fileNameWithExt,
            storagePath: storagePath,
            fileExtension: normalizedExtension,
            userId: userId,
            projectId: projectId,
        },
    });
}
