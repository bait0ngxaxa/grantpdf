import { z } from "zod";

export const PROJECT_NAME_MAX_LENGTH = 255;
export const DOCUMENT_FILE_NAME_MAX_LENGTH = 250;
export const DOCUMENT_TEXTAREA_MAX_LENGTH = 4000;
export const DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH = 2000;
export const DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH = 1000;

// สร้าง required string ที่มี error message ภาษาไทย
export function requiredString(label: string) {
    return z
        .string(`กรุณาระบุ${label}`)
        .trim()
        .min(1, { message: `กรุณาระบุ${label}` });
}

export function requiredBoundedString(label: string, maxLength: number) {
    return requiredString(label).max(maxLength, {
        message: `${label}ยาวเกินไป`,
    });
}

const PHONE_DIGIT_ONLY_REGEX = /^\d{10}$/;
const PHONE_DASHED_REGEX = /^\d{3}-\d{7}$/;

export function normalizePhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length !== 10) {
        return value.trim();
    }
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

// เบอร์โทรศัพท์ 10 หลัก ตัวเลขเท่านั้น
export const phoneSchema = z
    .string()
    .trim()
    .min(1, { message: "กรุณาระบุเบอร์โทร" })
    .refine(
        (val) => PHONE_DIGIT_ONLY_REGEX.test(val) || PHONE_DASHED_REGEX.test(val),
        { message: "เบอร์โทรต้องเป็นรูปแบบ 10 หลัก หรือ xxx-xxxxxxx" },
    )
    .transform((val) => normalizePhoneNumber(val));

// เบอร์โทรแบบ optional (ไม่บังคับ)
export const optionalPhoneSchema = z
    .string()
    .trim()
    .refine(
        (val) =>
            val === "" ||
            PHONE_DIGIT_ONLY_REGEX.test(val) ||
            PHONE_DASHED_REGEX.test(val),
        {
            message: "เบอร์โทรต้องเป็นรูปแบบ 10 หลัก หรือ xxx-xxxxxxx",
        },
    )
    .transform((val) => (val === "" ? "" : normalizePhoneNumber(val)));

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
