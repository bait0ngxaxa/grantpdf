import { SignJWT, jwtVerify } from "jose";

// Secret key for signing (should be in environment variables)
const getSecretKey = () => {
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

        if (
            typeof payload.fileId !== "number" ||
            typeof payload.userId !== "number"
        ) {
            return { valid: false, error: "Invalid token payload" };
        }

        return {
            valid: true,
            payload: {
                fileId: payload.fileId as number,
                userId: payload.userId as number,
                type: (payload.type as "userFile" | "attachment") || "userFile",
                fromAdminPanel: (payload.fromAdminPanel as boolean) || false,
            },
        };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("expired")) {
                return { valid: false, error: "Token expired" };
            }
            return { valid: false, error: error.message };
        }
        return { valid: false, error: "Invalid token" };
    }
}
