import { isIP } from "node:net";

function normalizeHeaderValue(value: string | null): string | undefined {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.toLowerCase() === "unknown") return undefined;
    return trimmed;
}

function stripIpPort(value: string): string {
    if (isIP(value)) return value;

    if (value.startsWith("[")) {
        const bracketEnd = value.indexOf("]");
        if (bracketEnd > 0) return value.slice(1, bracketEnd);
    }

    const lastColon = value.lastIndexOf(":");
    if (lastColon < 0 || value.indexOf(":") !== lastColon) return value;

    const address = value.slice(0, lastColon);
    const port = value.slice(lastColon + 1);
    if (!/^\d+$/.test(port)) return value;
    return address;
}

function parseSingleIp(value: string | null): string | undefined {
    const normalized = normalizeHeaderValue(value);
    if (!normalized || normalized.includes(",")) return undefined;

    const address = stripIpPort(normalized);
    return isIP(address) ? address : undefined;
}

function parseRightmostForwardedIp(value: string | null): string | undefined {
    const normalized = normalizeHeaderValue(value);
    if (!normalized) return undefined;

    const forwardedIps = normalized.split(",").map((part) => part.trim());
    const rightmostIp = forwardedIps.filter(Boolean).at(-1);
    return parseSingleIp(rightmostIp ?? null);
}

export function readClientIp(request: Request): string | undefined {
    const realIp = normalizeHeaderValue(request.headers.get("x-real-ip"));
    if (realIp) return parseSingleIp(realIp);

    return parseRightmostForwardedIp(request.headers.get("x-forwarded-for"));
}

export function getClientIpOrUnknown(request: Request): string {
    return readClientIp(request) ?? "unknown";
}
