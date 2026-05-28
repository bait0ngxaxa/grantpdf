import type { AdminDocumentFile } from "@/type/models";
import { PAGINATION } from "@/lib/constants";

export interface ProjectFilesResponse {
    files: AdminDocumentFile[];
    total: number;
    page: number;
    totalPages: number;
}

function isProjectFilesResponse(value: unknown): value is ProjectFilesResponse {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const response = value as Partial<ProjectFilesResponse>;
    return (
        Array.isArray(response.files) &&
        typeof response.total === "number" &&
        typeof response.page === "number" &&
        typeof response.totalPages === "number"
    );
}

function buildProjectFilesUrl(basePath: string, projectId: string, page: number): string {
    const params = new URLSearchParams({
        projectId,
        page: page.toString(),
        limit: PAGINATION.PROJECT_FILES_API_PAGE_LIMIT.toString(),
    });

    return `${basePath}?${params.toString()}`;
}

async function fetchProjectFilesPage(
    basePath: string,
    projectId: string,
    page: number,
): Promise<ProjectFilesResponse> {
    const response = await fetch(buildProjectFilesUrl(basePath, projectId, page));
    if (!response.ok) {
        throw new Error("Failed to fetch project files");
    }

    const data: unknown = await response.json();
    if (!isProjectFilesResponse(data)) {
        throw new Error("Invalid project files response");
    }

    return data;
}

export async function fetchAllProjectFiles(
    basePath: string,
    projectId: string,
): Promise<ProjectFilesResponse> {
    const firstPage = await fetchProjectFilesPage(basePath, projectId, 1);
    if (firstPage.totalPages <= 1) {
        return firstPage;
    }

    const remainingPages = Array.from(
        { length: firstPage.totalPages - 1 },
        (_, index) => index + 2,
    );
    const pageResults = await Promise.all(
        remainingPages.map((page) => fetchProjectFilesPage(basePath, projectId, page)),
    );

    return {
        ...firstPage,
        files: [
            ...firstPage.files,
            ...pageResults.flatMap((page) => page.files),
        ],
    };
}
