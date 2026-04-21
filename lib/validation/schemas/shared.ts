import { z } from "zod";
import {
    PROJECT_NAME_MAX_LENGTH,
    DOCUMENT_FILE_NAME_MAX_LENGTH,
    DOCUMENT_TEXTAREA_MAX_LENGTH,
    DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH,
    DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH,
} from "../constants";
import {
    PHONE_DIGIT_ONLY_REGEX,
    PHONE_DASHED_REGEX,
    normalizePhoneNumber,
    CITIZEN_ID_REGEX,
} from "../formatUtils";

export {
    PROJECT_NAME_MAX_LENGTH,
    DOCUMENT_FILE_NAME_MAX_LENGTH,
    DOCUMENT_TEXTAREA_MAX_LENGTH,
    DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH,
    DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH,
};

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

export { normalizePhoneNumber };

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
    .regex(CITIZEN_ID_REGEX, {
        message: "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น",
    });
