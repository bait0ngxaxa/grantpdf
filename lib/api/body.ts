interface ValidationErrorLike {
    issues: Array<{ message: string }>;
}

export async function readJsonBody(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return null;
    }
}

export function getFirstValidationMessage(
    error: ValidationErrorLike,
    fallback: string = "ข้อมูลไม่ถูกต้อง",
): string {
    return error.issues[0]?.message ?? fallback;
}
