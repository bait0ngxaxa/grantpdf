import { beforeEach, describe, expect, it, vi } from "vitest";
import { NOTIFICATION_AUDIENCE } from "@/lib/notifications/constants";

vi.mock("@/lib/server/auth/session", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit/rateLimit", () => ({
    applyRateLimit: vi.fn(),
}));

vi.mock("@/lib/services/notificationService", () => ({
    markAllNotificationsRead: vi.fn(),
    markAllNotificationsSeen: vi.fn(),
    markNotificationsRead: vi.fn(),
}));

import { auth } from "@/lib/server/auth/session";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import {
    markAllNotificationsRead,
    markAllNotificationsSeen,
    markNotificationsRead,
} from "@/lib/services/notificationService";
import { PATCH as patchRead } from "@/app/api/(user)/notifications/read/route";
import { PATCH as patchReadAll } from "@/app/api/(user)/notifications/read-all/route";
import { PATCH as patchSeenAll } from "@/app/api/(user)/notifications/seen-all/route";

const mockedAuth = vi.mocked(auth);
const mockedApplyRateLimit = vi.mocked(applyRateLimit);
const mockedMarkAllRead = vi.mocked(markAllNotificationsRead);
const mockedMarkAllSeen = vi.mocked(markAllNotificationsSeen);
const mockedMarkRead = vi.mocked(markNotificationsRead);

function buildPatchRequest(url: string, body?: unknown): Request {
    return new Request(url, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
}

describe("notification mutation routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAuth.mockResolvedValue({
            user: { id: "101", role: "admin" },
        } as never);
        mockedApplyRateLimit.mockResolvedValue({
            success: true,
            remaining: 9,
            resetTime: Date.now() + 60_000,
            headers: {},
        });
    });

    it("passes the current admin user id to read-all mutations", async () => {
        mockedMarkAllRead.mockResolvedValue(3);

        const response = await patchReadAll(
            buildPatchRequest(
                `http://localhost/api/notifications/read-all?audience=${NOTIFICATION_AUDIENCE.ADMIN}`,
            ) as never,
        );

        expect(response.status).toBe(200);
        expect(mockedMarkAllRead).toHaveBeenCalledWith(
            101,
            NOTIFICATION_AUDIENCE.ADMIN,
        );
    });

    it("passes the current admin user id to seen-all mutations", async () => {
        mockedMarkAllSeen.mockResolvedValue(2);

        const response = await patchSeenAll(
            buildPatchRequest(
                `http://localhost/api/notifications/seen-all?audience=${NOTIFICATION_AUDIENCE.ADMIN}`,
            ) as never,
        );

        expect(response.status).toBe(200);
        expect(mockedMarkAllSeen).toHaveBeenCalledWith(
            101,
            NOTIFICATION_AUDIENCE.ADMIN,
        );
    });

    it("passes selected notification ids with the current admin user id", async () => {
        mockedMarkRead.mockResolvedValue(1);

        const response = await patchRead(
            buildPatchRequest("http://localhost/api/notifications/read", {
                notificationIds: ["9001"],
            }) as never,
        );

        expect(response.status).toBe(200);
        expect(mockedMarkRead).toHaveBeenCalledWith(101, ["9001"]);
    });
});
