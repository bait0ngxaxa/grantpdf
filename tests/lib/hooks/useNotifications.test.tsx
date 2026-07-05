import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNotifications } from "@/lib/hooks/useNotifications";
import {
    NOTIFICATION_AUDIENCE,
    NOTIFICATION_TYPE,
} from "@/lib/notifications/constants";
import type {
    NotificationItem,
    NotificationsResponse,
} from "@/lib/notifications/types";

function makeNotification(id: string): NotificationItem {
    return {
        id,
        eventId: `event-${id}`,
        type: NOTIFICATION_TYPE.PROJECT_CREATED,
        audience: NOTIFICATION_AUDIENCE.USER,
        title: `รายการ ${id}`,
        message: `ข้อความ ${id}`,
        created_at: "2026-01-01T00:00:00.000Z",
    };
}

function makeResponse(
    ids: string[],
    nextCursor?: string,
): NotificationsResponse {
    return {
        notifications: ids.map(makeNotification),
        unreadCount: ids.length,
        unseenCount: ids.length,
        nextCursor,
    };
}

function createWrapper(): React.FC<{ children: React.ReactNode }> {
    return function TestWrapper({
        children,
    }: {
        children: React.ReactNode;
    }): React.JSX.Element {
        return (
            <SWRConfig
                value={{
                    provider: () => new Map(),
                    dedupingInterval: 0,
                    revalidateOnFocus: false,
                    revalidateOnReconnect: false,
                    refreshInterval: 0,
                }}
            >
                {children}
            </SWRConfig>
        );
    };
}

describe("useNotifications", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("appends the next notification page when loading more", async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock
            .mockResolvedValueOnce(
                Response.json(makeResponse(["1", "2"], "2")),
            )
            .mockResolvedValueOnce(Response.json(makeResponse(["3"])))
            .mockResolvedValueOnce(Response.json(makeResponse(["3-copy"])));

        const { result } = renderHook(
            () =>
                useNotifications({
                    audience: NOTIFICATION_AUDIENCE.USER,
                    refreshInterval: 0,
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => {
            expect(result.current.notifications.map((item) => item.id)).toEqual([
                "1",
                "2",
            ]);
        });

        await act(async () => {
            await result.current.loadMore();
        });

        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            "/api/notifications?limit=20&cursor=2&audience=user",
        );
        expect(result.current.notifications.map((item) => item.id)).toEqual([
            "1",
            "2",
            "3",
        ]);
        expect(result.current.hasMore).toBe(false);

        await act(async () => {
            await result.current.loadMore();
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result.current.notifications.map((item) => item.id)).toEqual([
            "1",
            "2",
            "3",
        ]);
    });
});
