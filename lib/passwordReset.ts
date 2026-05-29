import jwt, { type JwtPayload } from "jsonwebtoken";

const PASSWORD_RESET_TOKEN_TYPE = "password-reset" as const;
const PASSWORD_RESET_TOKEN_EXPIRES_IN = "1h";

export type PasswordResetTokenPayload = JwtPayload & {
    resetVersion: number;
    userId: string;
    type: typeof PASSWORD_RESET_TOKEN_TYPE;
};

function getPasswordResetTokenSecret(): string {
    const secret = process.env.PASSRESET_TOKEN_SECRET;

    if (!secret) {
        throw new Error("PASSRESET_TOKEN_SECRET is not defined.");
    }

    return secret;
}

function isPasswordResetTokenPayload(
    value: string | JwtPayload
): value is PasswordResetTokenPayload {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof value.resetVersion === "number" &&
        value.type === PASSWORD_RESET_TOKEN_TYPE &&
        typeof value.userId === "string"
    );
}

function normalizeBaseUrl(value: string | undefined): string | null {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") {
        return null;
    }

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null;
        }

        return parsed.origin;
    } catch {
        return null;
    }
}

export function createPasswordResetToken(
    userId: number,
    resetVersion: number
): string {
    return jwt.sign(
        {
            resetVersion,
            userId: String(userId),
            type: PASSWORD_RESET_TOKEN_TYPE,
        },
        getPasswordResetTokenSecret(),
        {
            expiresIn: PASSWORD_RESET_TOKEN_EXPIRES_IN,
        }
    );
}

export function verifyPasswordResetToken(
    token: string
): PasswordResetTokenPayload {
    const decodedToken = jwt.verify(token, getPasswordResetTokenSecret());

    if (!isPasswordResetTokenPayload(decodedToken)) {
        throw new Error("Invalid password reset token payload.");
    }

    return decodedToken;
}

export function resolvePasswordResetBaseUrl(): string {
    const envBaseUrl = normalizeBaseUrl(process.env.AUTH_URL);

    if (!envBaseUrl) {
        throw new Error(
            "AUTH_URL must be configured for password reset emails."
        );
    }

    return envBaseUrl;
}
