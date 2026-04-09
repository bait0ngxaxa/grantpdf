"use client";

import { FILE_UPLOAD } from "@/lib/constants";

const UPLOAD_TIMEOUT_ERROR_NAME = "UploadTimeoutError";
const UPLOAD_TIMEOUT_ERROR_MESSAGE = "UPLOAD_TIMEOUT";

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
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        });
    } catch (error) {
        if (timedOut) {
            throw createUploadTimeoutError();
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
