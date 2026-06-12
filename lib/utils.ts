import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
    TEXT_LIMITS,
    REPORT_STATUS_CONFIG,
    REPORT_TYPE_CONFIG,
    STATUS_CONFIG,
} from "@/lib/constants";
import type {
    ReportStatusConfigKey,
    ReportTypeConfigKey,
    StatusConfigKey,
} from "@/lib/constants";

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

const THAI_INITIAL_SKIP_PATTERN = /[\u0e30-\u0e3a\u0e40-\u0e4e]/u;
const AVATAR_INITIAL_PATTERN = /[\p{L}\p{N}]/u;
const THAI_NAME_PREFIX_PATTERN = /^(?:นาย|นางสาว|นาง)\s*/u;

function findAvatarInitial(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    const normalizedValue = value.trim().replace(THAI_NAME_PREFIX_PATTERN, "");

    for (const character of normalizedValue) {
        if (THAI_INITIAL_SKIP_PATTERN.test(character)) {
            continue;
        }

        if (AVATAR_INITIAL_PATTERN.test(character)) {
            return character.toLocaleUpperCase("th-TH");
        }
    }

    return null;
}

export function getAvatarInitial(
    primary: string | null | undefined,
    fallback: string | null | undefined,
    defaultInitial: string,
): string {
    return (
        findAvatarInitial(primary) ??
        findAvatarInitial(fallback) ??
        defaultInitial
    );
}

export function getStringField(
    data: unknown,
    fieldName: string
): string | undefined {
    if (typeof data !== "object" || data === null) {
        return undefined;
    }
    if (!(fieldName in data)) {
        return undefined;
    }
    const value = (data as Record<string, unknown>)[fieldName];
    if (typeof value !== "string") {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

const DEFAULT_BADGE_COLOR =
    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";

export const getStatusColor = (status: string): string => {
    const config = STATUS_CONFIG[status as StatusConfigKey];
    return config?.badgeColor ?? DEFAULT_BADGE_COLOR;
};

export const getReportStatusColor = (status: string): string => {
    const config = REPORT_STATUS_CONFIG[status as ReportStatusConfigKey];
    return config?.badgeColor ?? DEFAULT_BADGE_COLOR;
};

export const getReportTypeColor = (reportType: string): string => {
    const config = REPORT_TYPE_CONFIG[reportType as ReportTypeConfigKey];
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
