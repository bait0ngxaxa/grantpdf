import { readFile } from "node:fs/promises";
import path from "node:path";
import {
    parseZipArchive,
    readZipEntryData,
    ZIP_ARCHIVE_LIMITS,
    type ParsedZipArchive,
} from "./zipArchive";

export const OFFICE_ZIP_LIMITS = ZIP_ARCHIVE_LIMITS;

export interface OfficeOpenXmlValidationResult {
    valid: boolean;
    error?: string;
    entryCount: number;
    totalUncompressedSize: number;
    compressionRatio: number;
}

export function isOfficeOpenXmlExtension(filename: string): boolean {
    const extension = path.extname(filename).toLowerCase();
    return extension === ".docx" || extension === ".xlsx";
}

function createResult(
    valid: boolean,
    archive: ParsedZipArchive,
    error?: string,
): OfficeOpenXmlValidationResult {
    return {
        valid,
        error,
        entryCount: archive.entries.length,
        totalUncompressedSize: archive.totalUncompressedSize,
        compressionRatio: archive.compressionRatio,
    };
}

function containsXmlElement(buffer: Buffer, elementName: string): boolean {
    const xml = buffer.toString("utf8");
    return new RegExp(
        String.raw`<(?:(?:[A-Za-z_][\w.-]*):)?${elementName}\b`,
    ).test(xml);
}

function getRequiredEntryNames(filename: string): [string, string] {
    const documentEntry = path.extname(filename).toLowerCase() === ".docx"
        ? "word/document.xml"
        : "xl/workbook.xml";
    return ["[Content_Types].xml", documentEntry];
}

function getInvalidEntryError(
    contentTypesData: Buffer | string,
    documentData: Buffer | string,
): string {
    if (typeof contentTypesData === "string") return contentTypesData;
    if (typeof documentData === "string") return documentData;
    return "Office XML entry is invalid";
}

function validateRequiredXmlEntries(
    buffer: Buffer,
    archive: ParsedZipArchive,
    filename: string,
): string | null {
    const [contentTypesName, documentName] = getRequiredEntryNames(filename);
    const contentTypes = archive.entries.find((entry) => entry.name === contentTypesName);
    const document = archive.entries.find((entry) => entry.name === documentName);
    if (!contentTypes || !document) {
        return "Required Office Open XML entries are missing";
    }

    const contentTypesData = readZipEntryData(buffer, contentTypes);
    const documentData = readZipEntryData(buffer, document);
    if (typeof contentTypesData === "string" || typeof documentData === "string") {
        return getInvalidEntryError(contentTypesData, documentData);
    }
    if (!containsXmlElement(contentTypesData, "Types")) {
        return "[Content_Types].xml is invalid";
    }

    const documentElement = path.extname(filename).toLowerCase() === ".docx"
        ? "document"
        : "workbook";
    return containsXmlElement(documentData, documentElement)
        ? null
        : `${documentName} is invalid`;
}

export function validateOfficeOpenXmlBuffer(
    buffer: Buffer,
    filename: string,
): OfficeOpenXmlValidationResult {
    if (!isOfficeOpenXmlExtension(filename)) {
        return {
            valid: false,
            error: "File is not an Office Open XML document",
            entryCount: 0,
            totalUncompressedSize: 0,
            compressionRatio: 0,
        };
    }

    const parsed = parseZipArchive(buffer);
    if (typeof parsed === "string") {
        return {
            valid: false,
            error: parsed,
            entryCount: 0,
            totalUncompressedSize: 0,
            compressionRatio: 0,
        };
    }

    const error = validateRequiredXmlEntries(buffer, parsed, filename);
    return error ? createResult(false, parsed, error) : createResult(true, parsed);
}

export async function validateOfficeOpenXmlFile(
    filePath: string,
    filename: string,
): Promise<OfficeOpenXmlValidationResult> {
    return validateOfficeOpenXmlBuffer(await readFile(filePath), filename);
}
