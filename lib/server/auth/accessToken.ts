import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { SESSION } from "@/lib/shared/constants";

const ACCESS_TOKEN_TYPE = "access" as const;

export type AccessTokenPayload = {
    userId: number;
    role: string;
    sessionId: string;
    sessionVersion: number;
};

function getAccessTokenSecret(): Uint8Array {
    const secret =
        process.env.AUTH_ACCESS_TOKEN_SECRET ??
        process.env.AUTH_SECRET;

    if (!secret) {
        throw new Error("AUTH_ACCESS_TOKEN_SECRET or AUTH_SECRET must be set.");
    }

    return new TextEncoder().encode(secret);
}

function isAccessTokenPayload(value: JWTPayload): value is JWTPayload & {
    sub: string;
    role: string;
    sessionId: string;
    sessionVersion: number;
    tokenType: typeof ACCESS_TOKEN_TYPE;
} {
    return (
        typeof value.sub === "string" &&
        typeof value.role === "string" &&
        typeof value.sessionId === "string" &&
        typeof value.sessionVersion === "number" &&
        value.tokenType === ACCESS_TOKEN_TYPE
    );
}

export async function createAccessToken(
    payload: AccessTokenPayload
): Promise<string> {
    return new SignJWT({
        role: payload.role,
        sessionId: payload.sessionId,
        sessionVersion: payload.sessionVersion,
        tokenType: ACCESS_TOKEN_TYPE,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(payload.userId))
        .setIssuedAt()
        .setExpirationTime(`${SESSION.ACCESS_TOKEN_MAX_AGE_SECONDS}s`)
        .sign(getAccessTokenSecret());
}

export async function verifyAccessToken(
    token: string
): Promise<AccessTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getAccessTokenSecret());
        if (!isAccessTokenPayload(payload)) {
            return null;
        }

        const userId = Number(payload.sub);
        if (!Number.isInteger(userId) || userId <= 0) {
            return null;
        }

        return {
            userId,
            role: payload.role,
            sessionId: payload.sessionId,
            sessionVersion: payload.sessionVersion,
        };
    } catch {
        return null;
    }
}
