import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import type { SafeUser, CheckAdminResult } from "./types";

export async function checkAdminPermission(): Promise<CheckAdminResult> {
    const session = await auth();

    if (!session?.user?.id) {
        return { isAdmin: false, userId: null, session: null };
    }

    const userId = Number(session.user.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    return {
        isAdmin: user?.role === ROLES.ADMIN,
        userId,
        session,
    };
}

export async function getAllUsers(): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
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
    const user = await prisma.user.findUnique({
        where: { id },
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
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
    });
    return user !== null;
}

export async function getUserCount(): Promise<number> {
    return prisma.user.count();
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
    const where = search
        ? {
              OR: [
                  { name: { contains: search } },
                  { email: { contains: search } },
              ],
          }
        : {};

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
