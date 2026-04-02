import {
    phoneSchema,
    citizenIdSchema,
    normalizePhoneNumber,
} from "./schemas/shared";

export function formatPhoneInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) {
        return digits;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

export function formatCitizenIdInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 13);
}

export function validateAndFormatPhone(value: string): {
    value: string;
    error?: string;
} {
    const formatted = formatPhoneInput(value);
    // กรณีที่ไม่ได้กรอก ไม่ต้อง validate เพื่อให้ submit validation เป็นคนเตือน required เอง
    if (!formatted) {
        return { value: formatted };
    }
    const result = phoneSchema.safeParse(formatted);
    return {
        value: result.success ? normalizePhoneNumber(result.data) : formatted,
        error: result.success ? undefined : result.error.issues[0].message,
    };
}

export function validateAndFormatCitizenId(value: string): {
    value: string;
    error?: string;
} {
    const formatted = formatCitizenIdInput(value);
    if (!formatted) {
        return { value: formatted };
    }
    const result = citizenIdSchema.safeParse(formatted);
    return {
        value: formatted,
        error: result.success ? undefined : result.error.issues[0].message,
    };
}
