export function readClientIp(request: Request): string | undefined {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0]?.trim() || undefined;
    }

    return (
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        undefined
    );
}

export function getClientIpOrUnknown(request: Request): string {
    return readClientIp(request) ?? "unknown";
}
