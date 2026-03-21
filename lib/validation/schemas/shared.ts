import { z } from "zod";

// สร้าง required string ที่มี error message ภาษาไทย
export function requiredString(label: string) {
    return z
        .string(`กรุณาระบุ${label}`)
        .trim()
        .min(1, { message: `กรุณาระบุ${label}` });
}

// เบอร์โทรศัพท์ 10 หลัก ตัวเลขเท่านั้น
export const phoneSchema = z
    .string()
    .trim()
    .min(1, { message: "กรุณาระบุเบอร์โทร" })
    .regex(/^\d{10}$/, { message: "เบอร์โทรต้องเป็นตัวเลข 10 หลักเท่านั้น" });

// เบอร์โทรแบบ optional (ไม่บังคับ)
export const optionalPhoneSchema = z
    .string()
    .trim()
    .refine((val) => val === "" || /^\d{10}$/.test(val), {
        message: "เบอร์โทรต้องเป็นตัวเลข 10 หลักเท่านั้น",
    });

// อีเมลพร้อม error ภาษาไทย
export const emailSchema = z
    .string()
    .trim()
    .min(1, { message: "กรุณาระบุอีเมล" })
    .email({ message: "รูปแบบอีเมลไม่ถูกต้อง (เช่น example@mail.com)" });

// อีเมลแบบ optional
export const optionalEmailSchema = z
    .string()
    .trim()
    .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "รูปแบบอีเมลไม่ถูกต้อง (เช่น example@mail.com)",
    });

// เลขบัตรประชาชน 13 หลัก
export const citizenIdSchema = z
    .string()
    .trim()
    .min(1, { message: "กรุณาระบุเลขบัตรประชาชน" })
    .regex(/^\d{13}$/, {
        message: "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น",
    });
