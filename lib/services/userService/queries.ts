import { prisma } from "@/lib/server/db";
import {
    ROLES,
    USER_LIFECYCLE_STATUS,
} from "@/lib/shared/constants";

const ACTIVE_USER_WHERE = {
    status: USER_LIFECYCLE_STATUS.ACTIVE,
    deletedAt: null,
};
import type { SafeUser } from "./types";

export async function getAllUsers(): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
        where: ACTIVE_USER_WHERE,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    return users.map((user) => ({
        ...user,
        id: user.id.toString(),
    }));
}

export async function getUserById(id: number): Promise<SafeUser | null> {
    const user = await prisma.user.findFirst({
        where: { id, ...ACTIVE_USER_WHERE },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
    });

    if (!user) return null;

    return {
        ...user,
        id: user.id.toString(),
    };
}

export async function userExists(id: number): Promise<boolean> {
    const user = await prisma.user.findFirst({
        where: { id, ...ACTIVE_USER_WHERE },
        select: { id: true },
    });
    return user !== null;
}

export async function getUserCount(): Promise<number> {
    return prisma.user.count({ where: ACTIVE_USER_WHERE });
}

export interface CoOwnerUserOption {
    id: string;
    name: string;
    email: string;
}

export async function getCoOwnerUserOptions(): Promise<CoOwnerUserOption[]> {
    const users = await prisma.user.findMany({
        where: ACTIVE_USER_WHERE,
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: { name: "asc" },
    });

    return users.map((user) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
    }));
}

interface GetAllUsersPaginatedParams {
    page: number;
    limit: number;
    search?: string;
}

export interface PaginatedUsersResult {
    users: SafeUser[];
    total: number;
    page: number;
    totalPages: number;
    roleCounts: {
        admin: number;
        member: number;
    };
}

/**
 * Paginated + searchable admin users list. Search filters by name or email.
 */
export async function getAllUsersPaginated({
    page,
    limit,
    search,
}: GetAllUsersPaginatedParams): Promise<PaginatedUsersResult> {
    const skip = (page - 1) * limit;
    const where = {
        ...ACTIVE_USER_WHERE,
        ...(search
            ? {
                  OR: [
                      { name: { contains: search } },
                      { email: { contains: search } },
                  ],
              }
            : {}),
    };

    const [total, users, roleGroups] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
            orderBy: { created_at: "desc" },
            skip,
            take: limit,
        }),
        prisma.user.groupBy({
            by: ["role"],
            where,
            _count: { _all: true },
        }),
    ]);

    const roleCountMap = new Map<string, number>();
    for (const group of roleGroups) {
        roleCountMap.set(group.role ?? "", group._count._all);
    }

    return {
        users: users.map((user) => ({ ...user, id: user.id.toString() })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
        roleCounts: {
            admin: roleCountMap.get(ROLES.ADMIN) ?? 0,
            member: roleCountMap.get(ROLES.MEMBER) ?? 0,
        },
    };
}
