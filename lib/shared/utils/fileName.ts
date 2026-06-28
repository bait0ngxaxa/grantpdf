import { TEXT_LIMITS } from "@/lib/shared/constants";

export function truncateFileName(
    fileName: string | null | undefined,
    maxLength: number = TEXT_LIMITS.FILE_NAME_MAX_LENGTH,
): string {
    if (!fileName || typeof fileName !== "string") {
        return "ไม่มีชื่อไฟล์";
    }

    if (fileName.length <= maxLength) return fileName;

    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) {
        return fileName.substring(0, maxLength - 3) + "...";
    }

    const extension = fileName.substring(lastDotIndex + 1);
    const nameWithoutExt = fileName.substring(0, lastDotIndex);
    const truncatedName =
        nameWithoutExt.substring(0, maxLength - extension.length - 4) + "...";

    return `${truncatedName}.${extension}`;
}
