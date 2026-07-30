import { z } from "zod";
import { decodeUserFileCursor } from "@/lib/domain/files/cursor";
import { PAGINATION } from "@/lib/shared/constants";

export const generateSignedUrlSchema = z.object({
    fileId: z.coerce
        .number({ message: "รหัสไฟล์ไม่ถูกต้อง" })
        .int({ message: "รหัสไฟล์ไม่ถูกต้อง" })
        .positive({ message: "รหัสไฟล์ไม่ถูกต้อง" }),
    type: z.enum(["userFile", "attachment"]).default("userFile"),
    expiresIn: z.coerce
        .number({ message: "ค่าเวลาหมดอายุไม่ถูกต้อง" })
        .int({ message: "ค่าเวลาหมดอายุไม่ถูกต้อง" })
        .positive({ message: "ค่าเวลาหมดอายุไม่ถูกต้อง" })
        .max(60 * 60 * 24, { message: "ค่าเวลาหมดอายุมากเกินไป" })
        .default(3600),
    fromAdminPanel: z.boolean().optional().default(false),
});

export type GenerateSignedUrlInput = z.infer<typeof generateSignedUrlSchema>;

export const userDocumentsQuerySchema = z.object({
    cursor: z
        .string()
        .trim()
        .max(512, "ตัวระบุหน้าถัดไปไม่ถูกต้อง")
        .refine(
            (value) => decodeUserFileCursor(value) !== null,
            "ตัวระบุหน้าถัดไปไม่ถูกต้อง",
        )
        .optional(),
    limit: z.coerce
        .number()
        .int("จำนวนรายการไม่ถูกต้อง")
        .min(1, "จำนวนรายการไม่ถูกต้อง")
        .default(PAGINATION.USER_DOCUMENTS_API_DEFAULT_LIMIT),
});

export type UserDocumentsQueryInput = z.infer<
    typeof userDocumentsQuerySchema
>;
