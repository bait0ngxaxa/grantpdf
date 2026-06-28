interface RedirectUrlRequest {
    headers: Pick<Headers, "get">;
    nextUrl: Pick<URL, "origin">;
}

function firstHeaderValue(value: string | null): string | null {
    const [firstValue] = value?.split(",") ?? [];
    const trimmedValue = firstValue?.trim();
    return trimmedValue && trimmedValue !== "" ? trimmedValue : null;
}

function getForwardedProtocol(headers: Pick<Headers, "get">): string | null {
    const protocol = firstHeaderValue(headers.get("x-forwarded-proto"));
    if (protocol === "http" || protocol === "https") {
        return protocol;
    }

    return null;
}

function getForwardedHost(headers: Pick<Headers, "get">): string | null {
    const host = firstHeaderValue(headers.get("x-forwarded-host"));
    const fallbackHost = host ?? firstHeaderValue(headers.get("host"));

    if (!fallbackHost || /[/?#@\\]/.test(fallbackHost)) {
        return null;
    }

    return fallbackHost;
}

function getRequestProtocol(req: RedirectUrlRequest): string {
    return (
        getForwardedProtocol(req.headers) ??
        new URL(req.nextUrl.origin).protocol.slice(0, -1)
    );
}

function getPublicOrigin(req: RedirectUrlRequest): string {
    const host = getForwardedHost(req.headers);
    if (!host) {
        return req.nextUrl.origin;
    }

    try {
        return new URL(`${getRequestProtocol(req)}://${host}`).origin;
    } catch {
        return req.nextUrl.origin;
    }
}

export function buildRedirectUrl(
    req: RedirectUrlRequest,
    pathname: string
): URL {
    return new URL(pathname, getPublicOrigin(req));
}
