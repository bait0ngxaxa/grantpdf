import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProjectResult } from "./types";

export async function findOrCreateProject(
    userId: number,
    projectName: string,
    projectIdFromForm: string | null,
    documentTypeDescription: string
): Promise<ProjectResult | NextResponse> {
    let project;

    if (projectIdFromForm) {
        project = await prisma.project.findFirst({
            where: {
                id: parseInt(projectIdFromForm),
                userId: userId,
            },
        });

        if (!project) {
            return new NextResponse(
                "Project not found. Please select a valid project.",
                { status: 400 }
            );
        }
    } else {
        project = await prisma.project.findFirst({
            where: {
                name: projectName,
                userId: userId,
            },
        });

        if (!project) {
            project = await prisma.project.create({
                data: {
                    name: projectName,
                    description: `${projectName} - ${documentTypeDescription}`,
                    userId: userId,
                },
            });
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
    extension: string = "docx"
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
