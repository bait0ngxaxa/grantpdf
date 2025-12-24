"use client";

import { useState, useCallback } from "react";

interface DownloadOptions {
    fileId: string | number;
    type?: "userFile" | "attachment";
}

interface UseSignedDownloadReturn {
    download: (options: DownloadOptions) => Promise<void>;
    isDownloading: boolean;
    error: string | null;
}

/**
 * Hook for downloading files using signed URLs
 * ดาวน์โหลดไฟล์ผ่าน signed URL ที่มีความปลอดภัยสูง
 */
export function useSignedDownload(): UseSignedDownloadReturn {
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const download = useCallback(
        async ({ fileId, type = "userFile" }: DownloadOptions) => {
            setIsDownloading(true);
            setError(null);

            try {
                // Request signed URL from server
                const response = await fetch("/api/file/generate-url", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ fileId: Number(fileId), type }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Failed to get download URL");
                }

                const { signedUrl } = await response.json();

                // Open signed URL in new tab to trigger download
                window.open(signedUrl, "_blank");
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Download failed";
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
        const data = await response.json();
        throw new Error(data.error || "Failed to get download URL");
    }

    const { signedUrl } = await response.json();
    window.open(signedUrl, "_blank");
}
