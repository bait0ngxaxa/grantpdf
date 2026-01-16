import { prisma } from "@/lib/prisma";

// =====================================================
// Types
// =====================================================

interface SafeUser {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
    created_at: Date;
}

interface UpdateUserData {
    name?: string;
    role?: string;
}

// =====================================================
// Constants
// =====================================================

const VALID_ROLES = ["member", "admin"] as const;

// =====================================================
// Public API
// =====================================================

/**
 * Get all users (for admin view)
 */
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

/**
 * Get user by ID
 */
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

/**
 * Check if user exists
 */
export async function userExists(id: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
    });
    return user !== null;
}

/**
 * Validate role
 */
export function isValidRole(role: string): boolean {
    return VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]);
}

/**
 * Update user
 */
export async function updateUser(
    id: number,
    data: UpdateUserData
): Promise<SafeUser> {
    if (data.role && !isValidRole(data.role)) {
        throw new Error("บทบาทไม่ถูกต้อง");
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            ...data,
            updated_at: new Date(),
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
    });

    return {
        ...updatedUser,
        id: updatedUser.id.toString(),
    };
}

/**
 * Delete user
 */
export async function deleteUser(id: number): Promise<void> {
    await prisma.user.delete({
        where: { id },
    });
}

/**
 * Get total user count
 */
export async function getUserCount(): Promise<number> {
    return prisma.user.count();
}
