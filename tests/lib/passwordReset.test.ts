import jwt from "jsonwebtoken";
import { afterEach, describe, expect, it } from "vitest";
import {
    createPasswordResetToken,
    resolvePasswordResetBaseUrl,
    verifyPasswordResetToken,
} from "@/lib/passwordReset";

const originalPassResetSecret = process.env.PASSRESET_TOKEN_SECRET;
const originalAuthUrl = process.env.AUTH_URL;

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

    it("rejects tokens signed with an unrelated secret", () => {
        process.env.PASSRESET_TOKEN_SECRET = "passreset-secret";
        const unrelatedSecret = "unrelated-secret";

        const token = jwt.sign(
            { resetVersion: 0, userId: "42", type: "password-reset" },
            unrelatedSecret
        );

        expect(() => verifyPasswordResetToken(token)).toThrow();
    });

    it("uses AUTH_URL as the canonical password reset base URL", () => {
        process.env.AUTH_URL = "https://grants.example.com/app/login";

        expect(resolvePasswordResetBaseUrl()).toBe("https://grants.example.com");
    });

    it("throws when no canonical base URL is configured", () => {
        delete process.env.AUTH_URL;

        expect(() => resolvePasswordResetBaseUrl()).toThrow(
            "AUTH_URL must be configured for password reset emails."
        );
    });
});
