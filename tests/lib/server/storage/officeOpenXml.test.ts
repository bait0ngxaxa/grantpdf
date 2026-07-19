// @vitest-environment node
import PizZip from "pizzip";
import { describe, expect, it } from "vitest";
import {
    OFFICE_ZIP_LIMITS,
    validateOfficeOpenXmlBuffer,
} from "@/lib/server/storage/officeOpenXml";

function createZip(entries: Record<string, string>): Buffer {
    const zip = new PizZip();
    Object.entries(entries).forEach(([name, content]) => {
        zip.file(name, content);
    });
    return zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
}

function createOfficeZip(
    extension: "docx" | "xlsx",
    additionalEntries: Record<string, string> = {},
): Buffer {
    const documentEntry =
        extension === "docx" ? "word/document.xml" : "xl/workbook.xml";
    return createZip({
        "[Content_Types].xml": "<Types></Types>",
        [documentEntry]: extension === "docx"
            ? "<w:document></w:document>"
            : "<workbook></workbook>",
        ...additionalEntries,
    });
}

describe("Office Open XML ZIP validation", () => {
    it.each(["docx", "xlsx"])("accepts a valid .%s archive", (extension) => {
        const result = validateOfficeOpenXmlBuffer(
            createOfficeZip(extension as "docx" | "xlsx"),
            `document.${extension}`,
        );

        expect(result.valid).toBe(true);
        expect(result.entryCount).toBe(2);
    });

    it("rejects a generic ZIP without Office entries", () => {
        const result = validateOfficeOpenXmlBuffer(
            createZip({ "readme.txt": "not an Office document" }),
            "document.docx",
        );

        expect(result.valid).toBe(false);
        expect(result.error).toContain("Required Office Open XML entries");
    });

    it("rejects archives with too many entries", () => {
        const entries = Object.fromEntries(
            Array.from({ length: OFFICE_ZIP_LIMITS.maxEntries }, (_, index) => [
                `extra-${index}.xml`,
                "x",
            ]),
        );
        const result = validateOfficeOpenXmlBuffer(
            createOfficeZip("docx", entries),
            "document.docx",
        );

        expect(result.valid).toBe(false);
        expect(result.error).toContain("too many entries");
    });

    it("rejects archives over the total uncompressed size limit", () => {
        const archive = createOfficeZip("docx", { "payload.bin": "x" });
        const nameOffset = archive.lastIndexOf(Buffer.from("payload.bin"));
        expect(nameOffset).toBeGreaterThan(45);
        archive.writeUInt32LE(
            OFFICE_ZIP_LIMITS.maxTotalUncompressedBytes + 1,
            nameOffset - 46 + 24,
        );

        const result = validateOfficeOpenXmlBuffer(archive, "document.docx");

        expect(result.valid).toBe(false);
        expect(result.error).toContain("expands beyond");
    });

    it("rejects archives with an excessive compression ratio", () => {
        const result = validateOfficeOpenXmlBuffer(
            createOfficeZip("docx", { "payload.bin": "A".repeat(200_000) }),
            "document.docx",
        );

        expect(result.valid).toBe(false);
        expect(result.error).toContain("compression ratio");
    });
});
