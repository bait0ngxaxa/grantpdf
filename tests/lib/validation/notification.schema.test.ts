import { describe, expect, it } from "vitest";
import {
    clampNotificationFeedLimit,
    NOTIFICATION_AUDIENCE,
    NOTIFICATION_FEED,
} from "@/lib/notifications/constants";
import { notificationListQuerySchema } from "@/lib/validation/schemas";

describe("notificationListQuerySchema", () => {
    it("accepts the unread marker feed limit used by the UI", () => {
        const parsed = notificationListQuerySchema.safeParse({
            limit: NOTIFICATION_FEED.MARKER_LIMIT.toString(),
            unreadOnly: "true",
            audience: NOTIFICATION_AUDIENCE.ADMIN,
        });

        expect(parsed.success).toBe(true);
        if (!parsed.success) return;
        expect(parsed.data.limit).toBe(NOTIFICATION_FEED.MARKER_LIMIT);
        expect(parsed.data.unreadOnly).toBe(true);
        expect(parsed.data.audience).toBe(NOTIFICATION_AUDIENCE.ADMIN);
    });

    it("keeps the marker limit inside the API max limit", () => {
        expect(NOTIFICATION_FEED.MARKER_LIMIT).toBeLessThanOrEqual(
            NOTIFICATION_FEED.MAX_LIMIT,
        );
    });
});

describe("clampNotificationFeedLimit", () => {
    it("clamps client feed limits to the API-safe range", () => {
        expect(clampNotificationFeedLimit(undefined)).toBe(
            NOTIFICATION_FEED.DEFAULT_LIMIT,
        );
        expect(clampNotificationFeedLimit(0)).toBe(1);
        expect(clampNotificationFeedLimit(NOTIFICATION_FEED.MAX_LIMIT + 1)).toBe(
            NOTIFICATION_FEED.MAX_LIMIT,
        );
    });
});
