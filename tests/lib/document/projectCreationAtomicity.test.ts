import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    findProjectByNameAndUser: vi.fn(),
    findProjectByIdAndUser: vi.fn(),
    createProject: vi.fn(),
    reserveStorageQuota: vi.fn(),
    projectDeleteMany: vi.fn(),
    projectUpdateMany: vi.fn(),
    notificationFindMany: vi.fn(),
    notificationDeleteMany: vi.fn(),
    userFileCreate: vi.fn(),
    invalidateDashboardStats: vi.fn(),
    saveDocumentToStorage: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        $transaction: mocks.transaction,
    },
}));

vi.mock("@/lib/services/projectService", () => ({
    findProjectByNameAndUser: mocks.findProjectByNameAndUser,
    findProjectByIdAndUser: mocks.findProjectByIdAndUser,
    createProject: mocks.createProject,
}));

vi.mock("@/lib/services/storageQuotaService", () => ({
    reserveStorageQuota: mocks.reserveStorageQuota,
}));

vi.mock("@/lib/services/notificationEventService", () => ({
    notifyProjectDocumentUploaded: vi.fn(),
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: mocks.invalidateDashboardStats,
}));

vi.mock("@/lib/document/templateRenderer", () => ({
    loadTemplate: vi.fn().mockResolvedValue(Buffer.from("template")),
    createDocxRenderer: vi.fn().mockReturnValue({
        render: vi.fn(),
        getZip: vi.fn().mockReturnValue({
            generate: vi.fn().mockReturnValue(new Uint8Array([1])),
        }),
    }),
}));

vi.mock("@/lib/document/storage", () => ({
    saveDocumentToStorage: mocks.saveDocumentToStorage,
}));

import {
    createUserFileRecord,
    findOrCreateProject,
    withDocumentProjectCompensation,
} from "@/lib/document/projectService";
import { isProjectError } from "@/lib/document";
import { handleFormProjectGeneration } from "@/lib/document/handlers/formProjectHandler";

describe("document project creation atomicity", () => {
    let projectExists: boolean;
    let projectDeletedAt: Date | null;

    beforeEach(() => {
        vi.clearAllMocks();
        projectExists = false;
        projectDeletedAt = null;

        mocks.findProjectByNameAndUser.mockResolvedValue(null);
        mocks.createProject.mockImplementation(async () => {
            projectExists = true;
            return {
                id: "88",
                name: "โครงการใหม่",
                description: "สร้างจากเอกสาร",
                origin: "created",
                previousDeletedAt: null,
            };
        });
        mocks.reserveStorageQuota.mockResolvedValue(false);
        mocks.saveDocumentToStorage.mockRejectedValue(
            new Error("STORAGE_QUOTA_EXCEEDED"),
        );
        mocks.notificationFindMany.mockResolvedValue([]);
        mocks.notificationDeleteMany.mockResolvedValue({ count: 0 });
        mocks.projectDeleteMany.mockImplementation(async () => {
            if (!projectExists) return { count: 0 };
            projectExists = false;
            projectDeletedAt = null;
            return { count: 1 };
        });
        mocks.projectUpdateMany.mockImplementation(async () => {
            projectDeletedAt = new Date("2026-06-27T01:00:00.000Z");
            return { count: 1 };
        });

        const transactionClient = {
            project: {
                deleteMany: mocks.projectDeleteMany,
                updateMany: mocks.projectUpdateMany,
            },
            notificationEvent: {
                findMany: mocks.notificationFindMany,
                deleteMany: mocks.notificationDeleteMany,
            },
            userFile: { create: mocks.userFileCreate },
        };
        mocks.transaction.mockImplementation(async (callback) =>
            callback(transactionClient),
        );
    });

    it("removes a newly created project when document persistence fails", async () => {
        const resolution = await findOrCreateProject(
            7,
            "โครงการใหม่",
            null,
            3,
            "สร้างจากเอกสาร",
        );
        if (isProjectError(resolution)) {
            throw new Error("PROJECT_RESOLUTION_FAILED");
        }

        expect(resolution).toEqual({
            project: {
                id: 88,
                name: "โครงการใหม่",
                description: "สร้างจากเอกสาร",
            },
            origin: "created",
            previousDeletedAt: null,
        });

        await expect(
            withDocumentProjectCompensation(resolution, 7, () =>
                createUserFileRecord({
                    userId: 7,
                    projectId: resolution.project.id,
                    originalFileName: "เอกสารล้มเหลว",
                    storagePath: "storage/documents/failed.docx",
                    fileSize: 256,
                }),
            ),
        ).rejects.toThrow("STORAGE_QUOTA_EXCEEDED");

        expect(projectExists).toBe(false);
        expect(mocks.projectDeleteMany).toHaveBeenCalledWith({
            where: {
                id: 88,
                userId: 7,
                deletedAt: null,
                files: { none: {} },
                reports: { none: {} },
                coOwners: { none: {} },
            },
        });
    });

    it("compensates the project through the form-project handler failure path", async () => {
        const formData = new FormData();
        formData.set("projectName", "โครงการใหม่");
        formData.set("fileName", "เอกสารล้มเหลว");
        formData.set("programId", "3");

        await expect(
            handleFormProjectGeneration(formData, 7),
        ).rejects.toThrow("STORAGE_QUOTA_EXCEEDED");

        expect(projectExists).toBe(false);
        expect(mocks.projectDeleteMany).toHaveBeenCalledTimes(1);
    });

    it("restores an archived project when document persistence fails", async () => {
        const archivedAt = new Date("2026-06-27T01:00:00.000Z");
        projectExists = true;
        projectDeletedAt = archivedAt;
        mocks.createProject.mockResolvedValue({
            id: "88",
            name: "โครงการใหม่",
            description: "สร้างจากเอกสาร",
            origin: "restored",
            previousDeletedAt: archivedAt,
        });

        const resolution = await findOrCreateProject(
            7,
            "โครงการใหม่",
            null,
            3,
            "สร้างจากเอกสาร",
        );
        if (isProjectError(resolution)) {
            throw new Error("PROJECT_RESOLUTION_FAILED");
        }

        expect(resolution).toMatchObject({
            origin: "restored",
            previousDeletedAt: archivedAt,
        });

        await expect(
            withDocumentProjectCompensation(resolution, 7, () =>
                createUserFileRecord({
                    userId: 7,
                    projectId: resolution.project.id,
                    originalFileName: "เอกสารล้มเหลว",
                    storagePath: "storage/documents/failed.docx",
                    fileSize: 256,
                }),
            ),
        ).rejects.toThrow("STORAGE_QUOTA_EXCEEDED");

        expect(projectDeletedAt).toEqual(archivedAt);
        expect(mocks.projectDeleteMany).not.toHaveBeenCalled();
        expect(mocks.projectUpdateMany).toHaveBeenCalledWith({
            where: {
                id: 88,
                userId: 7,
                deletedAt: null,
                files: { none: {} },
                reports: { none: {} },
                coOwners: { none: {} },
            },
            data: {
                deletedAt: archivedAt,
                updated_at: expect.any(Date),
            },
        });
    });
});
