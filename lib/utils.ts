import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TEXT_LIMITS, STATUS_CONFIG } from "@/lib/constants";
import type { StatusConfigKey } from "@/lib/constants";

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

const DEFAULT_BADGE_COLOR =
    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";

export const getStatusColor = (status: string): string => {
    const config = STATUS_CONFIG[status as StatusConfigKey];
    return config?.badgeColor ?? DEFAULT_BADGE_COLOR;
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

export const formatNumericWithCommas = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }

    const normalized = trimmed.replace(/,/g, "").replace(/\s+/g, "");
    if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
        return trimmed;
    }

    const [integerPart, decimalPart] = normalized.split(".");
    const isNegative = integerPart.startsWith("-");
    const unsignedInteger = isNegative ? integerPart.slice(1) : integerPart;

    // Preserve identifier-like values that intentionally start with zero.
    if (/^0\d+$/.test(unsignedInteger)) {
        return trimmed;
    }

    const formattedInteger = unsignedInteger.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ",",
    );
    const signedFormattedInteger = isNegative
        ? `-${formattedInteger}`
        : formattedInteger;

    if (!decimalPart) {
        return signedFormattedInteger;
    }

    return `${signedFormattedInteger}.${decimalPart}`;
};
