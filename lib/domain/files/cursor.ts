import { z } from "zod";

const userFileCursorPayloadSchema = z
    .object({
        createdAt: z.string().min(1),
        id: z.number().int().positive(),
    })
    .strict()
    .refine(
        (payload) => Number.isFinite(Date.parse(payload.createdAt)),
        "ตัวระบุหน้าถัดไปไม่ถูกต้อง",
    );

export interface UserFileCursor {
    createdAt: Date;
    id: number;
}

export function encodeUserFileCursor(
    createdAt: Date,
    id: number,
): string {
    const payload = JSON.stringify({
        createdAt: createdAt.toISOString(),
        id,
    });

    return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeUserFileCursor(
    value: string,
): UserFileCursor | null {
    try {
        const decoded = Buffer.from(value, "base64url").toString("utf8");
        const parsed = userFileCursorPayloadSchema.safeParse(
            JSON.parse(decoded),
        );
        if (!parsed.success) return null;

        return {
            createdAt: new Date(parsed.data.createdAt),
            id: parsed.data.id,
        };
    } catch {
        return null;
    }
}
