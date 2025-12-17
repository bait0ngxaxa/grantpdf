import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PROJECT_STATUS } from "@/type/models";
import { TEXT_LIMITS } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getStatusColor = (status: string): string => {
    switch (status) {
        case PROJECT_STATUS.IN_PROGRESS:
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case PROJECT_STATUS.APPROVED:
            return "bg-green-100 text-green-800 border-green-200";
        case PROJECT_STATUS.REJECTED:
            return "bg-red-100 text-red-800 border-red-200";
        case PROJECT_STATUS.EDIT:
            return "bg-orange-100 text-orange-800 border-orange-200";
        case PROJECT_STATUS.CLOSED:
            return "bg-gray-100 text-gray-800 border-gray-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

export const truncateFileName = (
    fileName: string | null | undefined,
    maxLength: number = TEXT_LIMITS.FILE_NAME_MAX_LENGTH
): string => {
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
};
