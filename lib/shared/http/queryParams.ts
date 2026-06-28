export function parsePositiveInt(
    value: string | null,
    fallback: number,
): number {
    if (value === null) {
        return fallback;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1) {
        return fallback;
    }

    return parsed;
}
