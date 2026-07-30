export type FileResourceType = "userFile" | "attachment";

export interface FileResourceUrls {
    downloadUrl: string;
    previewUrl: string;
}

function encodeFileId(fileId: string | number): string {
    return encodeURIComponent(String(fileId));
}

export function getFileResourceUrls(
    fileId: string | number,
    type: FileResourceType,
): FileResourceUrls {
    const encodedFileId = encodeFileId(fileId);
    const downloadUrl =
        type === "userFile"
            ? `/api/user-docs/download/${encodedFileId}`
            : `/api/attachment/download/${encodedFileId}`;
    const previewUrl = `/api/preview?fileId=${encodedFileId}&type=${type}`;

    return { downloadUrl, previewUrl };
}
