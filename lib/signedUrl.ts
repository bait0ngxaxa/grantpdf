import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Secret key for signing (should be in environment variables)
const getSecretKey = (): Uint8Array => {
    const secret = process.env.FILE_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error("FILE_TOKEN_SECRET or NEXTAUTH_SECRET must be set");
    }
    return new TextEncoder().encode(secret);
};

export interface SignedUrlPayload {
    fileId: number;
    userId: number;
    type: "userFile" | "attachment";
    fromAdminPanel?: boolean;
}

export interface VerifyResult {
    valid: boolean;
    payload?: SignedUrlPayload;
    error?: string;
}

function parseSignedPayload(payload: JWTPayload): SignedUrlPayload | null {
    if (
        typeof payload.fileId !== "number" ||
        !Number.isInteger(payload.fileId) ||
        payload.fileId <= 0
    ) {
        return null;
    }

    if (
        typeof payload.userId !== "number" ||
        !Number.isInteger(payload.userId) ||
        payload.userId <= 0
    ) {
        return null;
    }

    if (payload.type !== "userFile" && payload.type !== "attachment") {
        return null;
    }

    const fromAdminPanel = payload.fromAdminPanel === true;

    return {
        fileId: payload.fileId,
        userId: payload.userId,
        type: payload.type,
        fromAdminPanel,
    };
}

export async function generateSignedToken(
    fileId: number,
    userId: number,
    type: "userFile" | "attachment" = "userFile",
    expiresIn: number = 3600,
    fromAdminPanel: boolean = false
): Promise<string> {
    const token = await new SignJWT({ fileId, userId, type, fromAdminPanel })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
        .sign(getSecretKey());

    return token;
}

export async function generateSignedUrl(
    fileId: number,
    userId: number,
    type: "userFile" | "attachment" = "userFile",
    expiresIn: number = 3600,
    fromAdminPanel: boolean = false
): Promise<string> {
    const token = await generateSignedToken(
        fileId,
        userId,
        type,
        expiresIn,
        fromAdminPanel
    );
    return `/api/file/${token}`;
}

export async function verifySignedToken(token: string): Promise<VerifyResult> {
    try {
        const { payload } = await jwtVerify(token, getSecretKey());
        const parsedPayload = parseSignedPayload(payload);
        if (!parsedPayload) {
            return { valid: false, error: "Invalid token payload" };
        }

        return {
            valid: true,
            payload: parsedPayload,
        };
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.toLowerCase().includes("expired")
        ) {
            return { valid: false, error: "Token expired" };
        }

        return { valid: false, error: "Invalid token" };
    }
}
