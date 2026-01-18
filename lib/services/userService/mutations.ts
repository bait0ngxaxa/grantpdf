import { prisma } from "@/lib/prisma";
import type { SafeUser, UpdateUserData } from "./types";
import { isValidRole } from "./constants";

export async function updateUser(
    id: number,
    data: UpdateUserData,
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

export async function deleteUser(id: number): Promise<void> {
    await prisma.user.delete({
        where: { id },
    });
}
