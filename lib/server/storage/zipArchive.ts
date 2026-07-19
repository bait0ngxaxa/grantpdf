import { inflateRawSync } from "node:zlib";

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const LOCAL_FILE_SIGNATURE = 0x04034b50;
const MAX_ZIP_COMMENT_LENGTH = 0xffff;

export const ZIP_ARCHIVE_LIMITS = {
    maxEntries: 1000,
    maxTotalUncompressedBytes: 100 * 1024 * 1024,
    maxCompressionRatio: 100,
    maxXmlEntryBytes: 2 * 1024 * 1024,
} as const;

export interface ZipEntry {
    name: string;
    compressionMethod: number;
    compressedSize: number;
    uncompressedSize: number;
    localHeaderOffset: number;
}

export interface ParsedZipArchive {
    entries: ZipEntry[];
    totalUncompressedSize: number;
    compressionRatio: number;
}

interface CentralDirectoryInfo {
    entryCount: number;
    offset: number;
    end: number;
}

interface ParsedCentralEntry {
    entry: ZipEntry;
    nextCursor: number;
}

function findEndOfCentralDirectory(buffer: Buffer): number {
    const minimumOffset = Math.max(
        0,
        buffer.length - 22 - MAX_ZIP_COMMENT_LENGTH,
    );

    for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
        if (buffer.readUInt32LE(offset) === EOCD_SIGNATURE) return offset;
    }
    return -1;
}

function readCentralDirectoryInfo(buffer: Buffer): CentralDirectoryInfo | string {
    if (buffer.length < 22) return "ZIP archive is truncated";
    const eocdOffset = findEndOfCentralDirectory(buffer);
    if (eocdOffset < 0) return "ZIP end record is missing";

    const diskNumber = buffer.readUInt16LE(eocdOffset + 4);
    const centralDirectoryDisk = buffer.readUInt16LE(eocdOffset + 6);
    const entriesOnDisk = buffer.readUInt16LE(eocdOffset + 8);
    const entryCount = buffer.readUInt16LE(eocdOffset + 10);
    const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
    const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);

    if (diskNumber !== 0 || centralDirectoryDisk !== 0 || entriesOnDisk !== entryCount) {
        return "Multi-disk or ZIP64 archives are not supported";
    }
    if (entryCount > ZIP_ARCHIVE_LIMITS.maxEntries) {
        return "Office ZIP contains too many entries";
    }
    if (
        centralDirectoryOffset > buffer.length ||
        centralDirectorySize > buffer.length - centralDirectoryOffset
    ) {
        return "ZIP central directory is out of bounds";
    }

    return {
        entryCount,
        offset: centralDirectoryOffset,
        end: centralDirectoryOffset + centralDirectorySize,
    };
}

function decodeEntryName(name: Buffer, flags: number): string {
    return name.toString((flags & 0x0800) === 0 ? "latin1" : "utf8");
}

function hasUnsafeEntryName(name: string): boolean {
    return (
        name.startsWith("/") ||
        name.includes("\\") ||
        name.split("/").includes("..")
    );
}

function readCentralEntry(
    buffer: Buffer,
    cursor: number,
    directoryEnd: number,
): ParsedCentralEntry | string {
    if (cursor + 46 > directoryEnd) return "ZIP central directory entry is truncated";
    if (buffer.readUInt32LE(cursor) !== CENTRAL_DIRECTORY_SIGNATURE) {
        return "ZIP central directory signature is invalid";
    }

    const flags = buffer.readUInt16LE(cursor + 8);
    const compressionMethod = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
    const recordEnd = cursor + 46 + nameLength + extraLength + commentLength;

    if (recordEnd > directoryEnd) return "ZIP entry metadata is truncated";
    if (
        compressedSize === 0xffffffff ||
        uncompressedSize === 0xffffffff ||
        localHeaderOffset === 0xffffffff
    ) {
        return "ZIP64 entries are not supported";
    }

    const name = decodeEntryName(
        buffer.subarray(cursor + 46, cursor + 46 + nameLength),
        flags,
    );
    if (hasUnsafeEntryName(name)) return "ZIP entry path is unsafe";

    return {
        entry: {
            name,
            compressionMethod,
            compressedSize,
            uncompressedSize,
            localHeaderOffset,
        },
        nextCursor: recordEnd,
    };
}

function getCompressionRatio(compressed: number, uncompressed: number): number {
    if (compressed > 0) return uncompressed / compressed;
    return uncompressed === 0 ? 1 : Number.POSITIVE_INFINITY;
}

function parseCentralDirectory(
    buffer: Buffer,
    info: CentralDirectoryInfo,
): ParsedZipArchive | string {
    const entries: ZipEntry[] = [];
    const names = new Set<string>();
    let cursor = info.offset;
    let totalCompressedSize = 0;
    let totalUncompressedSize = 0;

    for (let index = 0; index < info.entryCount; index += 1) {
        const parsed = readCentralEntry(buffer, cursor, info.end);
        if (typeof parsed === "string") return parsed;
        if (names.has(parsed.entry.name)) return "ZIP contains duplicate entries";
        names.add(parsed.entry.name);
        totalCompressedSize += parsed.entry.compressedSize;
        totalUncompressedSize += parsed.entry.uncompressedSize;
        if (totalUncompressedSize > ZIP_ARCHIVE_LIMITS.maxTotalUncompressedBytes) {
            return "Office ZIP expands beyond the allowed size";
        }
        entries.push(parsed.entry);
        cursor = parsed.nextCursor;
    }

    const compressionRatio = getCompressionRatio(
        totalCompressedSize,
        totalUncompressedSize,
    );
    if (compressionRatio > ZIP_ARCHIVE_LIMITS.maxCompressionRatio) {
        return "Office ZIP compression ratio is too high";
    }
    return { entries, totalUncompressedSize, compressionRatio };
}

export function parseZipArchive(buffer: Buffer): ParsedZipArchive | string {
    const info = readCentralDirectoryInfo(buffer);
    return typeof info === "string" ? info : parseCentralDirectory(buffer, info);
}

export function readZipEntryData(buffer: Buffer, entry: ZipEntry): Buffer | string {
    if (entry.uncompressedSize > ZIP_ARCHIVE_LIMITS.maxXmlEntryBytes) {
        return "Office XML entry is too large";
    }
    if (entry.localHeaderOffset + 30 > buffer.length) {
        return "ZIP local entry is out of bounds";
    }
    if (buffer.readUInt32LE(entry.localHeaderOffset) !== LOCAL_FILE_SIGNATURE) {
        return "ZIP local entry signature is invalid";
    }

    const nameLength = buffer.readUInt16LE(entry.localHeaderOffset + 26);
    const extraLength = buffer.readUInt16LE(entry.localHeaderOffset + 28);
    const dataOffset = entry.localHeaderOffset + 30 + nameLength + extraLength;
    const dataEnd = dataOffset + entry.compressedSize;
    if (dataOffset > buffer.length || dataEnd > buffer.length) {
        return "ZIP entry data is out of bounds";
    }

    const compressedData = buffer.subarray(dataOffset, dataEnd);
    try {
        const data =
            entry.compressionMethod === 0
                ? Buffer.from(compressedData)
                : entry.compressionMethod === 8
                  ? inflateRawSync(compressedData, {
                        maxOutputLength: ZIP_ARCHIVE_LIMITS.maxXmlEntryBytes,
                    })
                  : null;
        if (!data) return "Unsupported ZIP compression method";
        if (data.length !== entry.uncompressedSize) {
            return "ZIP entry size does not match metadata";
        }
        return data;
    } catch {
        return "ZIP entry could not be decompressed";
    }
}
