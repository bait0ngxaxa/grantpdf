import { FILE_TYPES, STATUS_FILTER } from "@/lib/shared/constants";
import { parseProjectSearchTerm } from "@/lib/domain/projects/search";
import { Prisma } from "@prisma/client";

interface AdminProjectFilterParams {
    search?: string;
    status?: string;
    fileType?: string;
    programId?: number;
}

export function buildAdminProjectsWhere(
    params: AdminProjectFilterParams,
): Prisma.ProjectWhereInput {
    const projectIdSearch = parseProjectSearchTerm(params.search).projectIdNumber;

    return {
        deletedAt: null,
        ...(params.programId ? { programId: params.programId } : {}),
        ...(params.search
            ? {
                  ...(projectIdSearch !== null
                      ? { id: projectIdSearch }
                      : {
                            OR: [
                                { name: { contains: params.search } },
                                { user: { name: { contains: params.search } } },
                                { user: { email: { contains: params.search } } },
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
                        }),
              }
            : {}),
        ...(params.status && params.status !== STATUS_FILTER.ALL
            ? { status: params.status }
            : {}),
        ...(params.fileType && params.fileType !== FILE_TYPES.ALL
            ? {
                  files: {
                      some: {
                          fileExtension: params.fileType,
                          projectReports: { none: {} },
                      },
                  },
              }
            : {}),
    };
}

export function buildAdminProjectsWhereSql(
    params: AdminProjectFilterParams,
): Prisma.Sql {
    const conditions: Prisma.Sql[] = [Prisma.sql`p.deleted_at IS NULL`];

    if (params.programId) {
        conditions.push(Prisma.sql`p.programId = ${params.programId}`);
    }

    if (params.search) {
        const keyword = `%${params.search}%`;
        const projectId = parseProjectSearchTerm(params.search).projectIdNumber;

        if (projectId !== null) {
            conditions.push(Prisma.sql`p.id = ${projectId}`);
        } else {
            conditions.push(
                Prisma.sql`(
                    p.name LIKE ${keyword}
                    OR u.name LIKE ${keyword}
                    OR u.email LIKE ${keyword}
                    OR EXISTS (
                        SELECT 1
                        FROM \`UserFile\` uf_search
                        WHERE uf_search.projectId = p.id
                          AND uf_search.originalFileName LIKE ${keyword}
                          AND NOT EXISTS (
                              SELECT 1
                              FROM \`ProjectReport\` pr_search
                              WHERE pr_search.fileId = uf_search.id
                          )
                    )
                )`,
            );
        }
    }

    if (params.status && params.status !== STATUS_FILTER.ALL) {
        conditions.push(Prisma.sql`p.status = ${params.status}`);
    }

    if (params.fileType && params.fileType !== FILE_TYPES.ALL) {
        conditions.push(
            Prisma.sql`EXISTS (
                SELECT 1
                FROM \`UserFile\` uf
                WHERE uf.projectId = p.id
                  AND uf.fileExtension = ${params.fileType}
                  AND NOT EXISTS (
                      SELECT 1
                      FROM \`ProjectReport\` pr
                      WHERE pr.fileId = uf.id
                  )
            )`,
        );
    }

    return Prisma.sql`${Prisma.join(conditions, " AND ")}`;
}
