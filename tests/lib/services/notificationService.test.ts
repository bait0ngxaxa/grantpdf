import { beforeEach, describe, expect, it, vi } from "vitest";
import { NOTIFICATION_AUDIENCE } from "@/lib/notifications/constants";
import type { prisma as prismaType } from "@/lib/server/db";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        notificationRecipient: {
            updateMany: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/server/db";
import {
    markAllNotificationsRead,
    markAllNotificationsSeen,
    markNotificationsRead,
} from "@/lib/services/notificationService";

type NotificationRecipientDelegate = typeof prismaType.notificationRecipient;
type UpdateManyResult = Awaited<
    ReturnType<NotificationRecipientDelegate["updateMany"]>
>;

const mockedUpdateMany = vi.mocked(prisma.notificationRecipient.updateMany);
const updatedOne: UpdateManyResult = { count: 1 };
const updatedTwo: UpdateManyResult = { count: 2 };

describe("notificationService recipient scoping", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("marks only the current admin recipient rows as read", async () => {
        mockedUpdateMany.mockResolvedValue(updatedTwo);

        const updated = await markAllNotificationsRead(
            101,
            NOTIFICATION_AUDIENCE.ADMIN,
        );

        expect(updated).toBe(2);
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                recipientUserId: 101,
                readAt: null,
                archivedAt: null,
                audience: NOTIFICATION_AUDIENCE.ADMIN,
            },
            data: {
                readAt: expect.any(Date),
                seenAt: expect.any(Date),
            },
        });
    });

    it("marks only the current admin recipient rows as seen", async () => {
        mockedUpdateMany.mockResolvedValue(updatedOne);

        const updated = await markAllNotificationsSeen(
            202,
            NOTIFICATION_AUDIENCE.ADMIN,
        );

        expect(updated).toBe(1);
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                recipientUserId: 202,
                seenAt: null,
                archivedAt: null,
                audience: NOTIFICATION_AUDIENCE.ADMIN,
            },
            data: {
                seenAt: expect.any(Date),
            },
        });
    });

    it("marks selected notifications only for the current recipient", async () => {
        mockedUpdateMany.mockResolvedValue(updatedTwo);

        const updated = await markNotificationsRead(303, [
            "9001",
            "invalid-id",
            "9002",
        ]);

        expect(updated).toBe(2);
        expect(mockedUpdateMany).toHaveBeenCalledWith({
            where: {
                id: { in: [BigInt("9001"), BigInt("9002")] },
                recipientUserId: 303,
            },
            data: {
                readAt: expect.any(Date),
                seenAt: expect.any(Date),
            },
        });
    });
});
