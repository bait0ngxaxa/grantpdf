import { FILE_UPLOAD, IDEMPOTENCY_HEADERS } from "@/lib/constants";

const UPLOAD_TIMEOUT_ERROR_NAME = "UploadTimeoutError";
const UPLOAD_TIMEOUT_ERROR_MESSAGE = "UPLOAD_TIMEOUT";
const RETRYABLE_UPLOAD_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function createUploadTimeoutError(): Error {
    const error = new Error(UPLOAD_TIMEOUT_ERROR_MESSAGE);
    error.name = UPLOAD_TIMEOUT_ERROR_NAME;
    return error;
}

export function isUploadTimeoutError(error: unknown): boolean {
    return (
        error instanceof Error &&
        error.name === UPLOAD_TIMEOUT_ERROR_NAME &&
        error.message === UPLOAD_TIMEOUT_ERROR_MESSAGE
    );
}

export function createUploadIdempotencyKey(): string {
    return crypto.randomUUID();
}

export function withUploadIdempotencyKey(
    init: RequestInit,
    idempotencyKey: string,
): RequestInit {
    const headers = new Headers(init.headers);
    headers.set(IDEMPOTENCY_HEADERS.PRIMARY, idempotencyKey);
    return { ...init, headers };
}

export async function fetchWithUploadTimeout(
    input: RequestInfo | URL,
    init: RequestInit,
    timeoutMs: number = FILE_UPLOAD.TIMEOUT_MS,
): Promise<Response> {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeoutMs);

    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } catch (error) {
        if (timedOut) throw createUploadTimeoutError();
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

function isRetryableUploadError(error: unknown): boolean {
    return isUploadTimeoutError(error) || error instanceof TypeError;
}

function getRetryDelayMs(response: Response | null, attempt: number): number {
    const retryAfter = response?.headers.get("Retry-After");
    const retryAfterMs = retryAfter ? Number(retryAfter) * 1_000 : Number.NaN;
    if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) return retryAfterMs;

    return Math.min(
        FILE_UPLOAD.RETRY_BASE_DELAY_MS * 2 ** attempt,
        FILE_UPLOAD.RETRY_MAX_DELAY_MS,
    );
}

function waitForRetry(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function fetchWithUploadRetry(
    input: RequestInfo | URL,
    init: RequestInit,
    idempotencyKey: string,
    timeoutMs: number = FILE_UPLOAD.TIMEOUT_MS,
): Promise<Response> {
    const requestInit = withUploadIdempotencyKey(init, idempotencyKey);

    for (let attempt = 0; attempt < FILE_UPLOAD.RETRY_MAX_ATTEMPTS; attempt += 1) {
        try {
            const response = await fetchWithUploadTimeout(input, requestInit, timeoutMs);
            const shouldRetry =
                RETRYABLE_UPLOAD_STATUSES.has(response.status) &&
                attempt < FILE_UPLOAD.RETRY_MAX_ATTEMPTS - 1;
            if (!shouldRetry) return response;
            await waitForRetry(getRetryDelayMs(response, attempt));
        } catch (error) {
            const shouldRetry =
                isRetryableUploadError(error) &&
                attempt < FILE_UPLOAD.RETRY_MAX_ATTEMPTS - 1;
            if (!shouldRetry) throw error;
            await waitForRetry(getRetryDelayMs(null, attempt));
        }
    }

    throw new Error("UPLOAD_RETRY_EXHAUSTED");
}
