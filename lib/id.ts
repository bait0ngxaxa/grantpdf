export function parsePositiveIntId(value: unknown): number | null {
    const parsed =
        typeof value === "number"
            ? value
            : typeof value === "string"
              ? Number(value)
              : Number.NaN;

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

export function isPositiveIntId(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}
