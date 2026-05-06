import { prisma } from "@/lib/prisma";
import type { ProgramSummary } from "@/type/models";

function toProgramSummary(program: {
    id: number;
    name: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
}): ProgramSummary {
    return {
        id: program.id.toString(),
        name: program.name,
        description: program.description ?? undefined,
        sortOrder: program.sortOrder,
        isActive: program.isActive,
    };
}

/** Active programs sorted by sortOrder — used by user-facing UI */
export async function getActivePrograms(): Promise<ProgramSummary[]> {
    const programs = await prisma.program.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
            id: true,
            name: true,
            description: true,
            sortOrder: true,
            isActive: true,
        },
    });

    return programs.map(toProgramSummary);
}

/** All programs (including inactive) — used by admin */
export async function getAllPrograms(): Promise<ProgramSummary[]> {
    const programs = await prisma.program.findMany({
        orderBy: { sortOrder: "asc" },
        select: {
            id: true,
            name: true,
            description: true,
            sortOrder: true,
            isActive: true,
        },
    });

    return programs.map(toProgramSummary);
}

/** Verify a program exists and is active */
export async function programExists(id: number): Promise<boolean> {
    const count = await prisma.program.count({
        where: { id, isActive: true },
    });
    return count > 0;
}

/** Verify a program exists regardless of active status — used by admin */
export async function programExistsById(id: number): Promise<boolean> {
    const count = await prisma.program.count({
        where: { id },
    });
    return count > 0;
}

interface CreateProgramData {
    name: string;
    description?: string;
}

export async function createProgram(
    data: CreateProgramData,
): Promise<ProgramSummary> {
    const maxOrder = await prisma.program.aggregate({
        _max: { sortOrder: true },
    });

    const program = await prisma.program.create({
        data: {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
        },
        select: {
            id: true,
            name: true,
            description: true,
            sortOrder: true,
            isActive: true,
        },
    });

    return toProgramSummary(program);
}

interface UpdateProgramData {
    name: string;
    description?: string;
    isActive: boolean;
    sortOrder: number;
}

export async function updateProgram(
    id: number,
    data: UpdateProgramData,
): Promise<ProgramSummary> {
    const program = await prisma.program.update({
        where: { id },
        data: {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            isActive: data.isActive,
            sortOrder: data.sortOrder,
            updated_at: new Date(),
        },
        select: {
            id: true,
            name: true,
            description: true,
            sortOrder: true,
            isActive: true,
        },
    });

    return toProgramSummary(program);
}
