import { prisma } from "@/lib/prisma";
import { parseActorUserId, toPrismaJsonValue } from "@/lib/auditUtils";
import type { SafeUser, UpdateUserData } from "./types";
import { isValidRole } from "./constants";
import type { Prisma } from "@prisma/client";

interface AuditContext {
    actorUserId: string | null;
    actorEmail?: string;
    ip?: string;
    userAgent?: string;
    requestId?: string;
}

function shouldInvalidateSession(
    currentRole: string | null,
    data: UpdateUserData,
): boolean {
    return typeof data.role === "string" && data.role !== currentRole;
}

function buildUserUpdateData(
    data: UpdateUserData,
    invalidateSession: boolean,
): Prisma.UserUpdateInput {
    return {
        ...data,
        updated_at: new Date(),
        ...(invalidateSession
            ? {
                  sessionVersion: {
                      increment: 1,
                  },
              }
            : {}),
    };
}

export async function updateUser(
    id: number,
    data: UpdateUserData,
): Promise<SafeUser> {
    if (data.role && !isValidRole(data.role)) {
        throw new Error("บทบาทไม่ถูกต้อง");
    }

    return prisma.$transaction(async (tx) => {
        const currentUser = await tx.user.findUnique({
            where: { id },
            select: {
                role: true,
            },
        });

        const invalidateSession = shouldInvalidateSession(
            currentUser?.role ?? null,
            data,
        );
        const updatedUser = await tx.user.update({
            where: { id },
            data: buildUserUpdateData(data, invalidateSession),
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
        });

        if (invalidateSession) {
            await tx.authSession.updateMany({
                where: {
                    userId: id,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            });
        }

        return {
            ...updatedUser,
            id: updatedUser.id.toString(),
        };
    });
}

export async function deleteUser(id: number): Promise<void> {
    await prisma.user.delete({
        where: { id },
    });
}

export async function updateUserWithAudit(
    id: number,
    data: UpdateUserData,
    audit: AuditContext,
): Promise<SafeUser> {
    if (data.role && !isValidRole(data.role)) {
        throw new Error("INVALID_ROLE");
    }

    return prisma.$transaction(async (tx) => {
        const beforeUser = await tx.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
        });

        if (!beforeUser) {
            throw new Error("USER_NOT_FOUND");
        }

        const invalidateSession = shouldInvalidateSession(beforeUser.role, data);
        const updatedUser = await tx.user.update({
            where: { id },
            data: buildUserUpdateData(data, invalidateSession),
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
        });

        if (invalidateSession) {
            await tx.authSession.updateMany({
                where: {
                    userId: id,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            });
        }

        await tx.auditLog.create({
            data: {
                action: "ADMIN_USER_UPDATE",
                outcome: "success",
                actorUserId: parseActorUserId(audit.actorUserId),
                actorEmail: audit.actorEmail ?? null,
                targetType: "user",
                targetId: updatedUser.id.toString(),
                ip: audit.ip ?? null,
                userAgent: audit.userAgent ?? null,
                requestId: audit.requestId ?? null,
                details: toPrismaJsonValue({
                    targetUserId: updatedUser.id.toString(),
                    targetUserEmail: updatedUser.email,
                    before: {
                        name: beforeUser.name,
                        role: beforeUser.role,
                    },
                    after: {
                        name: updatedUser.name,
                        role: updatedUser.role,
                    },
                }),
            },
        });

        return {
            ...updatedUser,
            id: updatedUser.id.toString(),
        };
    });
}

export async function deleteUserWithAudit(
    id: number,
    audit: AuditContext,
): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const targetUser = await tx.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!targetUser) {
            throw new Error("USER_NOT_FOUND");
        }

        await tx.user.delete({
            where: { id },
        });

        await tx.auditLog.create({
            data: {
                action: "ADMIN_USER_DELETE",
                outcome: "success",
                actorUserId: parseActorUserId(audit.actorUserId),
                actorEmail: audit.actorEmail ?? null,
                targetType: "user",
                targetId: targetUser.id.toString(),
                ip: audit.ip ?? null,
                userAgent: audit.userAgent ?? null,
                requestId: audit.requestId ?? null,
                details: toPrismaJsonValue({
                    targetUserId: targetUser.id.toString(),
                    targetUserEmail: targetUser.email,
                    deletedUser: {
                        name: targetUser.name,
                        role: targetUser.role,
                    },
                }),
            },
        });
    });
}
