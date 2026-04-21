export const PHONE_DIGIT_ONLY_REGEX = /^\d{10}$/;
export const PHONE_DASHED_REGEX = /^\d{3}-\d{7}$/;
export const CITIZEN_ID_REGEX = /^\d{13}$/;

export function normalizePhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length !== 10) {
        return value.trim();
    }

    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

export function isValidPhoneNumber(value: string): boolean {
    return (
        PHONE_DIGIT_ONLY_REGEX.test(value) || PHONE_DASHED_REGEX.test(value)
    );
}

export function isValidCitizenId(value: string): boolean {
    return CITIZEN_ID_REGEX.test(value);
}
