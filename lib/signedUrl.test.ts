import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock jose library with inline class definition
vi.mock("jose", () => {
    // Define MockSignJWT inside the factory
    class MockSignJWT {
        private payload: Record<string, unknown>;

        constructor(payload: Record<string, unknown>) {
            this.payload = payload;
        }

        setProtectedHeader() {
            return this;
        }

        setIssuedAt() {
            return this;
        }

        setExpirationTime() {
            return this;
        }

        async sign() {
            return "mocked.jwt.token." + JSON.stringify(this.payload);
        }
    }

    return {
        SignJWT: MockSignJWT,
        jwtVerify: async (token: string) => {
            if (token === "" || token === "invalid-token") {
                throw new Error("Invalid token");
            }
            if (
                token.includes("not.a.jwt") ||
                token === "eyJhbGciOiJIUzI1NiJ9" ||
                token === "eyJhbGciOiJIUzI1NiJ9.malformed"
            ) {
                throw new Error("Invalid token format");
            }
            if (token.endsWith("XXXXX")) {
                throw new Error("signature verification failed");
            }
            if (token.includes("expired")) {
                throw new Error("token expired");
            }
            // Parse payload from our mock token format
            try {
                const parts = token.split(".");
                if (parts.length >= 4) {
                    const payload = JSON.parse(parts.slice(3).join("."));
                    return { payload };
                }
            } catch {
                throw new Error("Invalid token");
            }
            throw new Error("Invalid token");
        },
    };
});

// Set env before import
process.env.NEXTAUTH_SECRET = "test-secret-key-minimum-32-characters-required";

import {
    generateSignedToken,
    generateSignedUrl,
    verifySignedToken,
} from "./signedUrl";

describe("Signed URL - Security Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ============================================
    // Token Generation Tests
    // ============================================
    describe("Token Generation", () => {
        it("should generate a token string", async () => {
            const token = await generateSignedToken(123, 456, "userFile", 3600);

            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
            expect(token.length).toBeGreaterThan(0);
        });

        it("should generate tokens with correct payload", async () => {
            const token = await generateSignedToken(123, 456, "userFile", 3600);

            expect(token).toContain("123");
            expect(token).toContain("456");
        });

        it("should include admin panel flag when specified", async () => {
            const token = await generateSignedToken(
                123,
                456,
                "userFile",
                3600,
                true,
            );

            expect(token).toContain("true");
        });
    });

    // ============================================
    // Signed URL Generation Tests
    // ============================================
    describe("Signed URL Generation", () => {
        it("should generate URL with correct path", async () => {
            const url = await generateSignedUrl(123, 456, "userFile", 3600);

            expect(url.startsWith("/api/file/")).toBe(true);
        });

        it("should include token in URL", async () => {
            const url = await generateSignedUrl(123, 456, "userFile", 3600);
            const token = url.replace("/api/file/", "");

            expect(token.length).toBeGreaterThan(0);
        });
    });

    // ============================================
    // Token Verification Tests
    // ============================================
    describe("Token Verification", () => {
        it("should reject invalid token", async () => {
            const result = await verifySignedToken("invalid-token");

            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject empty token", async () => {
            const result = await verifySignedToken("");

            expect(result.valid).toBe(false);
        });

        it("should reject tampered token", async () => {
            const result = await verifySignedToken("valid.token.hereXXXXX");

            expect(result.valid).toBe(false);
        });
    });

    // ============================================
    // Error Handling Tests
    // ============================================
    describe("Error Handling", () => {
        it("should handle malformed JWT gracefully", async () => {
            const malformedTokens = [
                "not.a.jwt",
                "eyJhbGciOiJIUzI1NiJ9",
                "eyJhbGciOiJIUzI1NiJ9.malformed",
            ];

            for (const token of malformedTokens) {
                const result = await verifySignedToken(token);
                expect(result.valid).toBe(false);
            }
        });
    });

    // ============================================
    // Security Concepts Tests
    // ============================================
    describe("Security Concepts", () => {
        it("should generate different tokens for different parameters", async () => {
            const token1 = await generateSignedToken(1, 100, "userFile", 3600);
            const token2 = await generateSignedToken(2, 100, "userFile", 3600);
            const token3 = await generateSignedToken(1, 200, "userFile", 3600);

            expect(token1).not.toBe(token2);
            expect(token1).not.toBe(token3);
        });

        it("should generate different tokens for different file types", async () => {
            const userFileToken = await generateSignedToken(
                1,
                100,
                "userFile",
                3600,
            );
            const attachmentToken = await generateSignedToken(
                1,
                100,
                "attachment",
                3600,
            );

            expect(userFileToken).not.toBe(attachmentToken);
        });

        it("should include all required fields in token payload", async () => {
            const token = await generateSignedToken(
                123,
                456,
                "attachment",
                3600,
                true,
            );

            expect(token).toContain("123");
            expect(token).toContain("456");
            expect(token).toContain("attachment");
            expect(token).toContain("true");
        });
    });
});
