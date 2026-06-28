interface ProgramProjectLike {
    programId?: string;
    programName?: string;
    _count?: {
        files: number;
    };
}

export interface ProgramGroup<T> {
    key: string;
    label: string;
    items: T[];
    projectCount: number;
    totalFiles: number;
    isUngrouped: boolean;
}

const UNGROUPED_KEY = "program:unassigned";
const UNGROUPED_LABEL = "ยังไม่ได้กำหนดโครงการหลัก";

export function groupProjectsByProgram<T extends ProgramProjectLike>(
    projects: T[],
): ProgramGroup<T>[] {
    const groups = new Map<string, ProgramGroup<T>>();

    for (const project of projects) {
        const key = project.programId
            ? `program:${project.programId}`
            : UNGROUPED_KEY;
        const label = project.programName || UNGROUPED_LABEL;

        const existing = groups.get(key);
        if (existing) {
            existing.items.push(project);
            existing.projectCount += 1;
            existing.totalFiles += project._count?.files ?? 0;
            continue;
        }

        groups.set(key, {
            key,
            label,
            items: [project],
            projectCount: 1,
            totalFiles: project._count?.files ?? 0,
            isUngrouped: key === UNGROUPED_KEY,
        });
    }

    return [...groups.values()].sort((left, right) => {
        if (left.isUngrouped === right.isUngrouped) {
            return left.label.localeCompare(right.label, "th");
        }

        return left.isUngrouped ? 1 : -1;
    });
}
