import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SafeUser, CheckAdminResult } from "./types";

export async function checkAdminPermission(): Promise<CheckAdminResult> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { isAdmin: false, userId: null, session: null };
    }

    const userId = Number(session.user.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    return {
        isAdmin: user?.role === "admin",
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
