import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/prisma";
import { ensureActiveSession } from "@/lib/services/sessionService/activeSession";

const mockedFindUnique = vi.mocked(prisma.user.findUnique);

function buildSession(overrides?: Partial<Session>): Session {
    return {
        expires: "2099-01-01T00:00:00.000Z",
        user: {
            id: "1",
            name: "Tester",
            email: "tester@example.com",
            role: "member",
            sessionVersion: 2,
        },
        ...overrides,
    };
}

describe("ensureActiveSession", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns null when session is missing", async () => {
        await expect(ensureActiveSession(null)).resolves.toBeNull();
    });

    it("returns null when user no longer exists", async () => {
        mockedFindUnique.mockResolvedValue(null as never);

        await expect(ensureActiveSession(buildSession())).resolves.toBeNull();
    });

    it("returns null when session version no longer matches", async () => {
        mockedFindUnique.mockResolvedValue(
            {
                role: "member",
                sessionVersion: 3,
            } as never
        );

        await expect(ensureActiveSession(buildSession())).resolves.toBeNull();
    });

    it("returns the active session with the latest role and session version", async () => {
        mockedFindUnique.mockResolvedValue(
            {
                role: "admin",
                sessionVersion: 2,
            } as never
        );

        const result = await ensureActiveSession(buildSession());

        expect(result?.user.id).toBe("1");
        expect(result?.user.role).toBe("admin");
        expect(result?.user.sessionVersion).toBe(2);
    });

    it("treats legacy sessions without a sessionVersion claim as version 0", async () => {
        mockedFindUnique.mockResolvedValue(
            {
                role: "member",
                sessionVersion: 0,
            } as never
        );

        const result = await ensureActiveSession(
            buildSession({
                user: {
                    id: "1",
                    name: "Tester",
                    email: "tester@example.com",
                    role: "member",
                },
            })
        );

        expect(result?.user.sessionVersion).toBe(0);
    });
});
