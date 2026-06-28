import { SORT_OPTIONS, STATUS_FILTER } from "@/lib/shared/constants";
import type { Prisma } from "@prisma/client";
import { buildUserProjectsAccessWhere } from "./projectAccess";

export const USER_PROJECT_SORT_ORDER_MAP: Record<
    string,
    Prisma.ProjectOrderByWithRelationInput
> = {
    [SORT_OPTIONS.CREATED_AT_ASC]: { created_at: "asc" },
    [SORT_OPTIONS.CREATED_AT_DESC]: { created_at: "desc" },
};

export function buildActiveUserFilesWhere(userId: number): {
    userId: number;
    projectReports: { none: Record<string, never> };
    project: { deletedAt: null };
} {
    return {
        userId,
        projectReports: { none: {} },
        project: { deletedAt: null },
    };
}

export function buildUserProjectsWhere(params: {
    userId: number;
    programId?: number;
    search?: string;
    status?: string;
}): Prisma.ProjectWhereInput {
    const conditions: Prisma.ProjectWhereInput[] = [
        buildUserProjectsAccessWhere(params.userId),
    ];

    if (params.programId) {
        conditions.push({ programId: params.programId });
    }

    if (params.status && params.status !== STATUS_FILTER.ALL) {
        conditions.push({ status: params.status });
    }

    if (params.search) {
        const projectId = Number(params.search);
        conditions.push(
            Number.isSafeInteger(projectId) && projectId > 0
                ? { id: projectId }
                : {
                      OR: [
                          { name: { contains: params.search } },
                          { description: { contains: params.search } },
                          { program: { name: { contains: params.search } } },
                          {
                              files: {
                                  some: {
                                      originalFileName: {
                                          contains: params.search,
                                      },
                                      projectReports: { none: {} },
                                  },
                              },
                          },
                      ],
                  },
        );
    }

    return { AND: conditions };
}
