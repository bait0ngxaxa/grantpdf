import { v4 as uuidv4 } from "uuid";

const ZWSP = "\u200B";
const THAI_CHAR_REGEX = /[\u0E00-\u0E7F]/;
const INVISIBLE_CHAR_REGEX = /[\u200B-\u200D\uFEFF\u00AD\u2060-\u206F\u034F\u061C]/g;
const SPECIAL_SPACE_REGEX = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;
const URL_TOKEN_REGEX = /\b(?:https?:\/\/|www\.)[^\s]+/gi;
const EMAIL_TOKEN_REGEX =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const CODE_TOKEN_REGEX =
    /\b(?=[A-Za-z0-9/_-]*\d)(?=[A-Za-z0-9/_-]*[A-Za-z])[A-Za-z0-9]+(?:[-_/][A-Za-z0-9]+)+\b/g;
const NUMBER_UNIT_TOKEN_REGEX = /\b\d[\d,]*(?:\.\d+)?(?:%|[A-Za-z]{1,8})?\b/g;
const PROTECTED_TOKEN_REGEX = new RegExp(
    [
        URL_TOKEN_REGEX.source,
        EMAIL_TOKEN_REGEX.source,
        CODE_TOKEN_REGEX.source,
        NUMBER_UNIT_TOKEN_REGEX.source,
    ].join("|"),
    "gi"
);

const normalizeText = (text: string): string =>
    text
        .replace(INVISIBLE_CHAR_REGEX, "")
        .replace(SPECIAL_SPACE_REGEX, " ")
        .normalize("NFC");

const segmentThaiText = (text: string, segmenter: Intl.Segmenter): string =>
    Array.from(segmenter.segment(text), (segment) => segment.segment).join(ZWSP);

const segmentThaiPreservingTokens = (
    line: string,
    segmenter: Intl.Segmenter
): string => {
    if (!THAI_CHAR_REGEX.test(line)) return line;

    let cursor = 0;
    const chunks: string[] = [];
    const tokenMatches = line.matchAll(PROTECTED_TOKEN_REGEX);

    for (const tokenMatch of tokenMatches) {
        const token = tokenMatch[0];
        const tokenStart = tokenMatch.index ?? 0;
        const beforeToken = line.slice(cursor, tokenStart);
        chunks.push(segmentThaiText(beforeToken, segmenter), token);
        cursor = tokenStart + token.length;
    }

    chunks.push(segmentThaiText(line.slice(cursor), segmenter));
    return chunks.join("");
};

export const fixThaiDistributed = (text: string): string => {
    if (!text || typeof text !== "string") return "";

    // Step 1: Remove existing invisible characters that might cause issues
    let result = normalizeText(text);

    // Step 2: Normalize line breaks
    result = result
        .replace(/\r\n|\r|\u2028/g, "\n")
        .replace(/\u2029/g, "\n\n")
        .replace(/[\u000B\u000C]/g, "\n");

    // Initialize Intl.Segmenter for Thai
    // Granularity 'word' ensures we get word segments
    const segmenter = new Intl.Segmenter("th", { granularity: "word" });

    // Step 3: Process text line by line to preserve line breaks
    const lines = result.split("\n");
    const processedLines = lines.map((line) => {
        if (!line.trim()) return line;

        // Check if line contains Thai characters
        const hasThaiChars = THAI_CHAR_REGEX.test(line);

        if (hasThaiChars) {
            return segmentThaiPreservingTokens(line, segmenter);
        }

        return line;
    });

    result = processedLines.join("\n");

    // Step 4: Clean up spacing issues
    result = result
        // Remove space before punctuation
        .replace(/\s+([.,:;!?])/g, "$1")
        // Reduce multiple spaces to single space
        .replace(/[ \t]{2,}/g, " ")
        // Remove leading/trailing spaces per line
        .replace(/^[ \t]+|[ \t]+$/gm, "")
        // Remove Word field codes and formatting marks
        .replace(/[\u0013-\u0015\u200E\u200F\u202A-\u202E]/g, "")
        // Clean up excessive empty lines
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\n+|\n+$/g, "")
        .trim();

    return result;
};

export const normalizeRichEditorText = (text: string): string => {
    if (!text || typeof text !== "string") return "";

    return normalizeText(text)
        .replace(/\r\n|\r|\u2028/g, "\n")
        .replace(/\u2029/g, "\n\n")
        .replace(/[\u000B\u000C]/g, "\n")
        .replace(/[\u0013-\u0015\u200E\u200F\u202A-\u202E]/g, "")
        .replace(/[ ]+([.,:;!?])/g, "$1")
        .replace(/\n{4,}/g, "\n\n\n")
        .replace(/^\n+|\n+$/g, "")
        .trim();
};

/**
 * Generate a unique filename with UUID prefix.
 * Preserves Thai characters in the filename.
 */
export const generateUniqueFilename = (originalName: string): string => {
    const lastDotIndex = originalName.lastIndexOf(".");
    const nameWithoutExt =
        lastDotIndex > 0
            ? originalName.substring(0, lastDotIndex)
            : originalName;
    const extension =
        lastDotIndex > 0 ? originalName.substring(lastDotIndex) : "";

    // Clean filename while preserving Thai characters
    const sanitizedName = nameWithoutExt
        .replace(/\s+/g, "_") // Convert spaces to underscores
        .replace(/[<>:"/\\|?*]/g, "") // Remove invalid filename characters only
        .substring(0, 50); // Limit length

    const uniqueId = uuidv4();
    return `${uniqueId}_${sanitizedName}${extension}`;
};

/**
 * Get MIME type from file extension.
 */
export const getMimeType = (fileExtension: string): string => {
    const ext = fileExtension.toLowerCase();
    switch (ext) {
        case "pdf":
            return "application/pdf";
        case "doc":
            return "application/msword";
        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "gif":
            return "image/gif";
        case "txt":
            return "text/plain";
        case "xls":
            return "application/vnd.ms-excel";
        case "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case "ppt":
            return "application/vnd.ms-powerpoint";
        case "pptx":
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        case "zip":
            return "application/zip";
        case "rar":
            return "application/x-rar-compressed";
        default:
            return "application/octet-stream";
    }
};

export default fixThaiDistributed;
