export interface ProjectSearchTerm {
    normalized: string;
    projectIdText: string | null;
    projectIdNumber: number | null;
}

export function parseProjectSearchTerm(search?: string): ProjectSearchTerm {
    const normalized = (search ?? "").trim().toLocaleLowerCase("th");
    const projectIdText = /^\d+$/.test(normalized) ? normalized : null;
    const projectIdNumber =
        projectIdText !== null ? Number(projectIdText) : null;
    const safeProjectIdNumber =
        projectIdNumber !== null &&
        Number.isSafeInteger(projectIdNumber) &&
        projectIdNumber > 0
            ? projectIdNumber
            : null;

    return {
        normalized,
        projectIdText: safeProjectIdNumber !== null ? projectIdText : null,
        projectIdNumber: safeProjectIdNumber,
    };
}
