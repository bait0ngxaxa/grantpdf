import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_ROUTES, ROLES } from "@/lib/shared/constants";
import type { UserApiData } from "@/type";

const swrMocks = vi.hoisted(() => ({
    useSWR: vi.fn(),
    mutate: vi.fn(),
}));

vi.mock("swr", () => ({
    default: swrMocks.useSWR,
    mutate: swrMocks.mutate,
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

import { useUserManagement } from "@/app/(admin)/admin/hooks/useUserManagement";

const localMutate = vi.fn();

const targetUser: UserApiData = {
    id: "2",
    name: "ผู้ใช้ทดสอบ",
    email: "member@example.com",
    role: ROLES.MEMBER,
    created_at: "2026-01-01T00:00:00.000Z",
};

describe("useUserManagement", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localMutate.mockResolvedValue(undefined);
        swrMocks.useSWR.mockReturnValue({
            data: {
                users: [targetUser],
                total: 2,
                page: 1,
                totalPages: 1,
                roleCounts: {
                    admin: 1,
                    member: 1,
                },
            },
            error: undefined,
            isLoading: false,
            mutate: localMutate,
        });
        swrMocks.mutate.mockResolvedValue(undefined);
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(Response.json({ success: true })),
        );
    });

    it("revalidates admin stats after deleting a user", async () => {
        const { result } = renderHook(() => useUserManagement());

        act(() => {
            result.current.openDeleteModal(targetUser);
        });

        await act(async () => {
            await result.current.handleDeleteUser();
        });

        expect(fetch).toHaveBeenCalledWith(`${API_ROUTES.ADMIN_USERS}/2`, {
            method: "DELETE",
        });
        expect(localMutate).toHaveBeenCalledOnce();
        expect(swrMocks.mutate).toHaveBeenCalledWith(
            `${API_ROUTES.ADMIN_PROJECTS}/stats`,
        );
    });
});
