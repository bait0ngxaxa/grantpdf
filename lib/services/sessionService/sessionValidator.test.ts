import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { validateSession } from "./sessionValidator";
import { isSessionError } from "./types";

// Mock next-auth getServerSession
vi.mock("next-auth", () => ({
    getServerSession: vi.fn(),
}));

// Mock authOptions
vi.mock("@/lib/auth", () => ({
    authOptions: {},
}));

import { getServerSession } from "next-auth";

const mockedGetServerSession = vi.mocked(getServerSession);

describe("sessionValidator", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("validateSession", () => {
        it("should return 401 when session is null", async () => {
            mockedGetServerSession.mockResolvedValue(null);

            const result = await validateSession();

            expect(result).toBeInstanceOf(NextResponse);
            expect(isSessionError(result)).toBe(true);
            if (result instanceof NextResponse) {
                expect(result.status).toBe(401);
            }
        });

        it("should return 401 when session.user is undefined", async () => {
            mockedGetServerSession.mockResolvedValue({
                expires: "2024-01-01",
            } as never);

            const result = await validateSession();

            expect(result).toBeInstanceOf(NextResponse);
            if (result instanceof NextResponse) {
                expect(result.status).toBe(401);
            }
        });

        it("should return 401 when session.user.id is undefined", async () => {
            mockedGetServerSession.mockResolvedValue({
                expires: "2024-01-01",
                user: {
                    name: "Test User",
                    email: "test@example.com",
                },
            } as never);

            const result = await validateSession();

            expect(result).toBeInstanceOf(NextResponse);
            if (result instanceof NextResponse) {
                expect(result.status).toBe(401);
            }
        });

        it("should return SessionValidationResult when session is valid", async () => {
            const mockSession = {
                expires: "2024-12-31",
                user: {
                    id: "123",
                    name: "Test User",
                    email: "test@example.com",
                },
            };
            mockedGetServerSession.mockResolvedValue(mockSession as never);

            const result = await validateSession();

            expect(isSessionError(result)).toBe(false);
            if (!isSessionError(result)) {
                expect(result.userId).toBe(123);
                expect(result.session).toEqual(mockSession);
            }
        });

        it("should convert string user id to number", async () => {
            const mockSession = {
                expires: "2024-12-31",
                user: {
                    id: "456",
                    name: "Another User",
                    email: "another@example.com",
                },
            };
            mockedGetServerSession.mockResolvedValue(mockSession as never);

            const result = await validateSession();

            if (!isSessionError(result)) {
                expect(result.userId).toBe(456);
                expect(typeof result.userId).toBe("number");
            }
        });

        it("should handle numeric user id", async () => {
            const mockSession = {
                expires: "2024-12-31",
                user: {
                    id: 789,
                    name: "Numeric ID User",
                    email: "numeric@example.com",
                },
            };
            mockedGetServerSession.mockResolvedValue(mockSession as never);

            const result = await validateSession();

            if (!isSessionError(result)) {
                expect(result.userId).toBe(789);
            }
        });
    });

    describe("isSessionError type guard", () => {
        it("should return true for NextResponse", () => {
            const response = new NextResponse("Unauthorized", { status: 401 });
            expect(isSessionError(response)).toBe(true);
        });

        it("should return false for SessionValidationResult", () => {
            const validResult = {
                userId: 123,
                session: {
                    expires: "2024-12-31",
                    user: { id: "123", name: "Test", email: "test@test.com" },
                },
            };
            expect(isSessionError(validResult as never)).toBe(false);
        });
    });
});
