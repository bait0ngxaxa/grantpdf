import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    notifyProjectCoOwnersAssigned,
    notifyProjectCreated,
    notifyProjectDocumentUploaded,
    notifyProjectReportSubmitted,
    notifyProjectReportReviewed,
    notifyProjectStatusUpdated,
} from "@/lib/services/notificationEventService";

interface MockTransactionClient {
    user: {
        findMany: ReturnType<typeof vi.fn>;
    };
    project: {
        findUnique: ReturnType<typeof vi.fn>;
    };
    notificationEvent: {
        create: ReturnType<typeof vi.fn>;
    };
}

function createTransactionClient(): MockTransactionClient {
    return {
        user: {
            findMany: vi.fn(),
        },
        project: {
            findUnique: vi.fn(),
        },
        notificationEvent: {
            create: vi.fn(),
        },
    };
}

describe("notificationEventService", () => {
    let tx: MockTransactionClient;

    beforeEach(() => {
        tx = createTransactionClient();
        tx.notificationEvent.create.mockResolvedValue({ id: BigInt(1) });
    });

    it("notifies admin audience even when the project creator is also an admin", async () => {
        tx.user.findMany.mockResolvedValue([{ id: 1 }, { id: 5 }, { id: 6 }]);

        await notifyProjectCreated(tx as never, {
            projectId: 88,
            projectName: "โครงการแจ้งเตือน",
            actorUserId: 1,
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledTimes(1);
        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    title: "มีโครงการใหม่",
                    actionUrl: "/admin?projectId=88&notificationTarget=project",
                    recipients: {
                        create: [
                            { recipientUserId: 1, audience: "admin" },
                            { recipientUserId: 5, audience: "admin" },
                            { recipientUserId: 6, audience: "admin" },
                        ],
                    },
                }),
            }),
        );
    });

    it("does not create user-audience self acknowledgements for project creation", async () => {
        tx.user.findMany.mockResolvedValue([{ id: 1 }, { id: 5 }, { id: 6 }]);

        await notifyProjectCreated(tx as never, {
            projectId: 88,
            projectName: "โครงการแจ้งเตือน",
            actorUserId: 1,
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    recipients: {
                        create: [
                            { recipientUserId: 1, audience: "admin" },
                            { recipientUserId: 5, audience: "admin" },
                            { recipientUserId: 6, audience: "admin" },
                        ],
                    },
                }),
            }),
        );
    });

    it("notifies admin audience even when the report submitter is also an admin", async () => {
        tx.project.findUnique.mockResolvedValue({
            name: "โครงการรายงาน",
            coOwners: [],
        });
        tx.user.findMany.mockResolvedValue([{ id: 1 }, { id: 5 }]);

        await notifyProjectReportSubmitted(tx as never, {
            reportId: 44,
            projectId: 88,
            reportType: "รายงานความก้าวหน้า",
            actorUserId: 1,
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledTimes(1);
        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    title: "มีรายงานใหม่ในโครงการ",
                    projectReportId: 44,
                    actionUrl: "/admin?projectId=88&notificationTarget=reports",
                    recipients: {
                        create: [
                            { recipientUserId: 1, audience: "admin" },
                            { recipientUserId: 5, audience: "admin" },
                        ],
                    },
                }),
            }),
        );
    });

    it("always notifies admin audience for submitted reports even when the project has co-owners", async () => {
        tx.project.findUnique.mockResolvedValue({
            name: "โครงการรายงาน",
            coOwners: [{ coOwnerUserId: 1 }],
        });
        tx.user.findMany.mockResolvedValue([{ id: 1 }, { id: 5 }]);

        await notifyProjectReportSubmitted(tx as never, {
            reportId: 44,
            projectId: 88,
            reportType: "รายงานความก้าวหน้า",
            actorUserId: 1,
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    title: "มีรายงานใหม่ในโครงการ",
                    actionUrl: "/admin?projectId=88&notificationTarget=reports",
                    recipients: {
                        create: [
                            { recipientUserId: 1, audience: "admin" },
                            { recipientUserId: 5, audience: "admin" },
                        ],
                    },
                }),
            }),
        );
    });

    it("notifies the project owner and co-owners when an admin updates project status", async () => {
        await notifyProjectStatusUpdated(tx as never, {
            projectId: 88,
            projectName: "โครงการแจ้งเตือน",
            ownerUserId: 7,
            coOwnerUserIds: [9, 10],
            status: "อนุมัติ",
            actorUserId: 1,
            updatedAt: new Date("2026-06-26T01:00:00.000Z"),
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    title: "สถานะโครงการถูกอัปเดต",
                    recipients: {
                        create: [
                            { recipientUserId: 7, audience: "user" },
                            { recipientUserId: 9, audience: "user" },
                            { recipientUserId: 10, audience: "user" },
                        ],
                    },
                }),
            }),
        );
    });

    it("notifies the report owner and co-owners when an admin reviews a report", async () => {
        await notifyProjectReportReviewed(tx as never, {
            reportId: 44,
            projectId: 88,
            projectName: "โครงการแจ้งเตือน",
            reportType: "รายงานความก้าวหน้า",
            status: "อนุมัติแล้ว",
            ownerUserId: 7,
            coOwnerUserIds: [9, 10],
            actorUserId: 1,
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    title: "ผลตรวจรายงานพร้อมแล้ว",
                    recipients: {
                        create: [
                            { recipientUserId: 7, audience: "user" },
                            { recipientUserId: 9, audience: "user" },
                            { recipientUserId: 10, audience: "user" },
                        ],
                    },
                }),
            }),
        );
    });

    it("allows a same-account user audience recipient for admin-to-user events", async () => {
        await notifyProjectStatusUpdated(tx as never, {
            projectId: 88,
            projectName: "โครงการแจ้งเตือน",
            ownerUserId: 1,
            status: "อนุมัติ",
            actorUserId: 1,
            updatedAt: new Date("2026-06-26T01:00:00.000Z"),
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    recipients: {
                        create: [{ recipientUserId: 1, audience: "user" }],
                    },
                }),
            }),
        );
    });

    it("notifies admin audience when a project document is uploaded", async () => {
        tx.project.findUnique.mockResolvedValue({ name: "โครงการเอกสาร" });
        tx.user.findMany.mockResolvedValue([{ id: 1 }, { id: 5 }]);

        await notifyProjectDocumentUploaded(tx as never, {
            fileId: 123,
            projectId: 88,
            fileName: "เอกสารแนบ.pdf",
            actorUserId: 7,
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    type: "PROJECT_DOCUMENT_UPLOADED",
                    title: "มีเอกสารใหม่ในโครงการ",
                    actionUrl: "/admin?projectId=88&notificationTarget=files",
                    recipients: {
                        create: [
                            { recipientUserId: 1, audience: "admin" },
                            { recipientUserId: 5, audience: "admin" },
                        ],
                    },
                }),
            }),
        );
    });

    it("uses user audience for every co-owner assignment notification", async () => {
        await notifyProjectCoOwnersAssigned(tx as never, {
            projectId: 88,
            projectName: "โครงการเจ้าของร่วม",
            assignedUserIds: [5, 7],
            actorUserId: 1,
            assignedAt: new Date("2026-06-26T01:00:00.000Z"),
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledTimes(1);
        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    actionUrl: "/userdashboard?projectId=88&notificationTarget=project",
                    recipients: {
                        create: [
                            { recipientUserId: 5, audience: "user" },
                            { recipientUserId: 7, audience: "user" },
                        ],
                    },
                }),
            }),
        );
    });

    it("notifies the assigned co-owner even when the actor is the same user", async () => {
        await notifyProjectCoOwnersAssigned(tx as never, {
            projectId: 88,
            projectName: "โครงการเจ้าของร่วม",
            assignedUserIds: [1],
            actorUserId: 1,
            assignedAt: new Date("2026-06-26T01:00:00.000Z"),
        });

        expect(tx.notificationEvent.create).toHaveBeenCalledTimes(1);
        expect(tx.notificationEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    actionUrl: "/userdashboard?projectId=88&notificationTarget=project",
                    recipients: {
                        create: [{ recipientUserId: 1, audience: "user" }],
                    },
                }),
            }),
        );
    });
});
