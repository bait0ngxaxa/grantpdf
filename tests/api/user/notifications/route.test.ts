import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    NOTIFICATION_AUDIENCE,
    NOTIFICATION_FEED,
} from "@/lib/notifications/constants";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    getNotificationsForUser: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/services";
import { GET } from "@/app/api/(user)/notifications/route";

const mockedAuth = vi.mocked(auth);
const mockedGetNotificationsForUser = vi.mocked(getNotificationsForUser);

describe("notifications route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("accepts the unread marker query used by dashboard markers", async () => {
        mockedAuth.mockResolvedValue({ user: { id: "7" } } as never);
        mockedGetNotificationsForUser.mockResolvedValue({
            notifications: [],
            unreadCount: 0,
            unseenCount: 0,
        });

        const request = new Request(
            `http://localhost/api/notifications?limit=${NOTIFICATION_FEED.MARKER_LIMIT}&unreadOnly=true&audience=${NOTIFICATION_AUDIENCE.ADMIN}`,
        );
        const response = await GET(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.notifications).toEqual([]);
        expect(mockedGetNotificationsForUser).toHaveBeenCalledWith({
            userId: 7,
            cursor: undefined,
            limit: NOTIFICATION_FEED.MARKER_LIMIT,
            unreadOnly: true,
            audience: NOTIFICATION_AUDIENCE.ADMIN,
        });
    });
});
