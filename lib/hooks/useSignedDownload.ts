"use client";

import { useState, useCallback } from "react";

interface DownloadOptions {
    fileId: string | number;
    type?: "userFile" | "attachment";
    fromAdminPanel?: boolean;
}

interface UseSignedDownloadReturn {
    download: (options: DownloadOptions) => Promise<void>;
    isDownloading: boolean;
    error: string | null;
}

export function useSignedDownload(): UseSignedDownloadReturn {
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const download = useCallback(
        async ({
            fileId,
            type = "userFile",
            fromAdminPanel = false,
        }: DownloadOptions) => {
            setIsDownloading(true);
            setError(null);

            try {
                // Request signed URL from server
                const response = await fetch("/api/file/generate-url", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fileId: Number(fileId),
                        type,
                        fromAdminPanel,
                    }),
                });

                if (!response.ok) {
                    const data: unknown = await response.json().catch(() => null);
                    const message =
                        typeof data === "object" &&
                        data !== null &&
                        "error" in data &&
                        typeof (data as { error?: unknown }).error === "string"
                            ? (data as { error: string }).error
                            : "ไม่สามารถสร้างลิงก์ดาวน์โหลดได้";
                    throw new Error(message);
                }

                const { signedUrl } = await response.json();

                // Open signed URL in new tab to trigger download
                window.open(signedUrl, "_blank");
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "ไม่สามารถดาวน์โหลดไฟล์ได้";
                setError(message);
                console.error("Download error:", err);
            } finally {
                setIsDownloading(false);
            }
        },
        []
    );

    return { download, isDownloading, error };
}

/**
 * Standalone download function (for simple cases)
 */
export async function downloadWithSignedUrl(
    fileId: string | number,
    type: "userFile" | "attachment" = "userFile"
): Promise<void> {
    const response = await fetch("/api/file/generate-url", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId: Number(fileId), type }),
    });

    if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        const message =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error?: unknown }).error === "string"
                ? (data as { error: string }).error
                : "ไม่สามารถสร้างลิงก์ดาวน์โหลดได้";
        throw new Error(message);
    }

    const { signedUrl } = await response.json();
    window.open(signedUrl, "_blank");
}
