import jwt from "jsonwebtoken";
import { afterEach, describe, expect, it } from "vitest";
import {
    createPasswordResetToken,
    resolvePasswordResetBaseUrl,
    verifyPasswordResetToken,
} from "@/lib/passwordReset";

const originalPassResetSecret = process.env.PASSRESET_TOKEN_SECRET;
const originalAuthUrl = process.env.AUTH_URL;
const originalNextAuthUrl = process.env.NEXTAUTH_URL;
const originalNextAuthSecret = process.env.NEXTAUTH_SECRET;

describe("password reset helpers", () => {
    afterEach(() => {
        if (originalPassResetSecret === undefined) {
            delete process.env.PASSRESET_TOKEN_SECRET;
        } else {
            process.env.PASSRESET_TOKEN_SECRET = originalPassResetSecret;
        }

        if (originalAuthUrl === undefined) {
            delete process.env.AUTH_URL;
        } else {
            process.env.AUTH_URL = originalAuthUrl;
        }

        if (originalNextAuthUrl === undefined) {
            delete process.env.NEXTAUTH_URL;
        } else {
            process.env.NEXTAUTH_URL = originalNextAuthUrl;
        }

        if (originalNextAuthSecret === undefined) {
            delete process.env.NEXTAUTH_SECRET;
        } else {
            process.env.NEXTAUTH_SECRET = originalNextAuthSecret;
        }
    });

    it("creates and verifies password reset tokens with a scoped type claim", () => {
        process.env.PASSRESET_TOKEN_SECRET = "passreset-secret";

        const token = createPasswordResetToken(42, 3);
        const payload = verifyPasswordResetToken(token);

        expect(payload.resetVersion).toBe(3);
        expect(payload.userId).toBe("42");
        expect(payload.type).toBe("password-reset");
    });

    it("rejects tokens that are signed correctly but missing the reset token type", () => {
        process.env.PASSRESET_TOKEN_SECRET = "passreset-secret";

        const token = jwt.sign(
            { resetVersion: 0, userId: "42" },
            process.env.PASSRESET_TOKEN_SECRET
        );

        expect(() => verifyPasswordResetToken(token)).toThrow(
            "Invalid password reset token payload."
        );
    });

    it("rejects tokens signed with NEXTAUTH_SECRET instead of PASSRESET_TOKEN_SECRET", () => {
        process.env.PASSRESET_TOKEN_SECRET = "passreset-secret";
        process.env.NEXTAUTH_SECRET = "nextauth-secret";

        const token = jwt.sign(
            { resetVersion: 0, userId: "42", type: "password-reset" },
            process.env.NEXTAUTH_SECRET
        );

        expect(() => verifyPasswordResetToken(token)).toThrow();
    });

    it("uses AUTH_URL as the canonical password reset base URL", () => {
        process.env.AUTH_URL = "https://grants.example.com/app/login";
        delete process.env.NEXTAUTH_URL;

        expect(resolvePasswordResetBaseUrl()).toBe("https://grants.example.com");
    });

    it("falls back to NEXTAUTH_URL when AUTH_URL is unavailable", () => {
        delete process.env.AUTH_URL;
        process.env.NEXTAUTH_URL = "https://auth.example.com/reset";

        expect(resolvePasswordResetBaseUrl()).toBe("https://auth.example.com");
    });

    it("throws when no canonical base URL is configured", () => {
        delete process.env.AUTH_URL;
        delete process.env.NEXTAUTH_URL;

        expect(() => resolvePasswordResetBaseUrl()).toThrow(
            "AUTH_URL or NEXTAUTH_URL must be configured for password reset emails."
        );
    });
});
