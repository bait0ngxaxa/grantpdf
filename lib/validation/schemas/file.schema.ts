import { z } from "zod";

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
