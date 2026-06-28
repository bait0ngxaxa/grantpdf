import { prisma } from "@/lib/server/db";
import { Prisma } from "@prisma/client";
import { buildAdminProjectsWhereSql } from "./adminProjectFilters";
import { getStatusPriority } from "./adminProjectSort";
import type { StatusSortKey } from "./adminProjectQueryTypes";

export async function findProjectIdsByStatusSort(params: {
    page: number;
    limit: number;
    sortBy: StatusSortKey;
    programId?: number;
    search?: string;
    status?: string;
    fileType?: string;
}): Promise<number[]> {
    const skip = (params.page - 1) * params.limit;
    const whereSql = buildAdminProjectsWhereSql(params);
    const statusPriority = getStatusPriority(params.sortBy);
    const statusRankSql = Prisma.sql`FIELD(
        p.status,
        ${Prisma.join(statusPriority)}
    )`;

    const rows = await prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
        SELECT p.id
        FROM \`Project\` p
        LEFT JOIN \`User\` u ON u.id = p.userId
        WHERE ${whereSql}
        ORDER BY (${statusRankSql} = 0) ASC, ${statusRankSql} ASC, p.created_at DESC
        LIMIT ${params.limit}
        OFFSET ${skip}
    `);

    return rows.map((row) => row.id);
}
