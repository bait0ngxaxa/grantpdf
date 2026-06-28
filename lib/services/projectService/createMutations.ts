import { parseActorUserId, toPrismaJsonValue } from "@/lib/server/audit/auditUtils";
import { prisma } from "@/lib/server/db";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { notifyProjectCreated } from "@/lib/services/notificationEventService";
import type { Project } from "@prisma/client";
import {
    findProjectForCreate,
    getProjectForCreate,
    isUniqueConstraintError,
    toProjectWithStringId,
} from "./mutationShared";
import type { ProjectAuditContext } from "./types";

function normalizeProjectText(
    name: string,
    description?: string,
): {
    name: string;
    description: string | null;
} {
    return {
        name: name.trim(),
        description:
            description && description.trim() !== "" ? description.trim() : null,
    };
}

function shouldRejectProgramConflict(
    existing: {
        programId: number | null;
        deletedAt: Date | null;
    } | null,
    programId: number | undefined,
): boolean {
    return Boolean(
        existing &&
            existing.deletedAt === null &&
            programId &&
            existing.programId !== null &&
            existing.programId !== programId,
    );
}

export async function createProject(
    userId: number,
    name: string,
    description?: string,
    programId?: number,
): Promise<{ id: string } & Omit<Project, "id">> {
    const normalized = normalizeProjectText(name, description);

    try {
        const project = await prisma.$transaction(async (tx) => {
            const existing = await tx.project.findUnique({
                where: { userId_name: { userId, name: normalized.name } },
                select: { id: true, programId: true, deletedAt: true },
            });

            if (shouldRejectProgramConflict(existing, programId)) {
                throw new Error("PROJECT_NAME_CONFLICT");
            }

            const shouldNotify = existing === null || existing.deletedAt !== null;
            const created = await (existing
                ? tx.project.update({
                      where: { id: existing.id },
                      data: {
                          ...(existing.deletedAt !== null
                              ? { deletedAt: null }
                              : {}),
                          ...(existing.programId === null && programId
                              ? { programId }
                              : {}),
                          ...(existing.deletedAt !== null && programId
                              ? { programId }
                              : {}),
                          updated_at: new Date(),
                      },
                      include: {
                          files: true,
                          _count: { select: { files: true } },
                      },
                  })
                : tx.project.create({
                      data: {
                          name: normalized.name,
                          description: normalized.description,
                          userId,
                          programId: programId ?? null,
                      },
                      include: {
                          files: true,
                          _count: { select: { files: true } },
                      },
                  }));
            if (shouldNotify) {
                await notifyProjectCreated(tx, {
                    projectId: created.id,
                    projectName: created.name,
                    actorUserId: userId,
                });
            }
            return created;
        });

        await invalidateDashboardStats([userId]);
        return toProjectWithStringId(project);
    } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;

        const existing = await findProjectForCreate(userId, normalized.name);
        if (!existing) throw error;

        if (shouldRejectProgramConflict(existing, programId)) {
            throw new Error("PROJECT_NAME_CONFLICT");
        }

        const project =
            existing.programId === null && programId
                ? await prisma.project.update({
                      where: { id: existing.id },
                      data: {
                          programId,
                          deletedAt: null,
                          updated_at: new Date(),
                      },
                      include: {
                          files: true,
                          _count: { select: { files: true } },
                      },
                  })
                : existing.deletedAt !== null
                  ? await prisma.project.update({
                        where: { id: existing.id },
                        data: {
                            deletedAt: null,
                            ...(programId ? { programId } : {}),
                            updated_at: new Date(),
                        },
                        include: {
                            files: true,
                            _count: { select: { files: true } },
                        },
                    })
                  : await getProjectForCreate(existing.id);

        await invalidateDashboardStats([userId]);
        return toProjectWithStringId(project);
    }
}

export async function createProjectWithAudit(
    userId: number,
    name: string,
    description: string | undefined,
    programId: number | undefined,
    audit: ProjectAuditContext,
): Promise<{ id: string } & Omit<Project, "id">> {
    const normalized = normalizeProjectText(name, description);

    const project = await prisma.$transaction(async (tx) => {
        const existing = await tx.project.findUnique({
            where: { userId_name: { userId, name: normalized.name } },
            select: { id: true, programId: true, deletedAt: true },
        });

        if (shouldRejectProgramConflict(existing, programId)) {
            throw new Error("PROJECT_NAME_CONFLICT");
        }

        const created = existing
            ? await tx.project.update({
                  where: { id: existing.id },
                  data: {
                      ...(existing.deletedAt !== null
                          ? { deletedAt: null }
                          : {}),
                      ...(existing.programId === null && programId
                          ? { programId }
                          : {}),
                      ...(existing.deletedAt !== null && programId
                          ? { programId }
                          : {}),
                      updated_at: new Date(),
                  },
                  include: {
                      files: true,
                      _count: { select: { files: true } },
                  },
              })
            : await tx.project.create({
                  data: {
                      userId,
                      name: normalized.name,
                      description: normalized.description,
                      programId: programId ?? null,
                  },
                  include: {
                      files: true,
                      _count: { select: { files: true } },
                  },
              });

        await tx.auditLog.create({
            data: {
                action: "PROJECT_CREATE",
                outcome: "success",
                actorUserId: parseActorUserId(audit.actorUserId),
                actorEmail: audit.actorEmail ?? null,
                targetType: "project",
                targetId: created.id.toString(),
                ip: audit.ip ?? null,
                userAgent: audit.userAgent ?? null,
                requestId: audit.requestId ?? null,
                details: toPrismaJsonValue({
                    projectId: created.id,
                    projectName: created.name,
                    description: created.description,
                    programId: created.programId,
                    reusedExistingProject: existing !== null,
                    restoredArchivedProject: existing?.deletedAt !== null,
                }),
            },
        });

        if (existing === null || existing.deletedAt !== null) {
            await notifyProjectCreated(tx, {
                projectId: created.id,
                projectName: created.name,
                actorUserId: userId,
            });
        }

        return created;
    });

    await invalidateDashboardStats([userId]);
    return toProjectWithStringId(project);
}
