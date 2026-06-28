export function getStringField(
    data: unknown,
    fieldName: string,
): string | undefined {
    if (typeof data !== "object" || data === null) {
        return undefined;
    }
    if (!(fieldName in data)) {
        return undefined;
    }

    const value = (data as Record<string, unknown>)[fieldName];
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
