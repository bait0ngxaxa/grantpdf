import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
        project = await findProjectByIdAndUser(
            parseInt(projectIdFromForm),
            userId,
        );

        if (!project) {
            return new NextResponse(
                "Project not found. Please select a valid project.",
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
    const fileNameWithExt = originalFileName.endsWith(`.${extension}`)
        ? originalFileName
        : `${originalFileName}.${extension}`;

    return await prisma.userFile.create({
        data: {
            originalFileName: fileNameWithExt,
            storagePath: storagePath,
            fileExtension: extension,
            userId: userId,
            projectId: projectId,
        },
    });
}
