import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PROJECT_STATUS } from "@/type/models";
import { TEXT_LIMITS } from "@/lib/constants";

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

export const getStatusColor = (status: string): string => {
    switch (status) {
        case PROJECT_STATUS.IN_PROGRESS:
            return "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30";
        case PROJECT_STATUS.APPROVED:
            return "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30";
        case PROJECT_STATUS.REJECTED:
            return "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30";
        case PROJECT_STATUS.EDIT:
            return "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30";
        case PROJECT_STATUS.CLOSED:
            return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";
        default:
            return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";
    }
};

export const truncateFileName = (
    fileName: string | null | undefined,
    maxLength: number = TEXT_LIMITS.FILE_NAME_MAX_LENGTH,
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
