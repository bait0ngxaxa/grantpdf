// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import PizZip from "pizzip";
import {
    streamFileToPath,
    type StreamedFileMetadata,
} from "@/lib/server/storage/streamFileToPath";

const temporaryDirectories: string[] = [];

function createZip(entries: Record<string, string>): Buffer {
    const zip = new PizZip();
    Object.entries(entries).forEach(([name, content]) => {
        zip.file(name, content);
    });
    return zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
}

afterEach(async () => {
    await Promise.all(
        temporaryDirectories.splice(0).map((directory) =>
            rm(directory, { recursive: true, force: true }),
        ),
    );
});

describe("streamFileToPath", () => {
    it("records invalid Office structure after streaming a generic ZIP", async () => {
        const directory = await mkdtemp(
            path.join(os.tmpdir(), "grant-online-upload-"),
        );
        temporaryDirectories.push(directory);

        const content = createZip({ "readme.txt": "not an Office file" });
        const file = new File(
            [content as unknown as ArrayBuffer],
            "document.docx",
            {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            },
        );
        const destination = path.join(directory, "document.docx");

        const metadata = await streamFileToPath(file, destination);

        expect(metadata.detectedMime).toBe("application/zip");
        expect(metadata.officeStructure?.valid).toBe(false);
    });

    it("detects and persists the file without calling arrayBuffer", async () => {
        const directory = await mkdtemp(
            path.join(os.tmpdir(), "grant-online-upload-"),
        );
        temporaryDirectories.push(directory);

        const content = Buffer.from("%PDF-1.7\nstreamed-content");
        const file = new File([content], "document.pdf", {
            type: "application/pdf",
        });
        const arrayBufferSpy = vi.spyOn(file, "arrayBuffer");
        const destination = path.join(directory, "document.pdf");

        const metadata: StreamedFileMetadata = await streamFileToPath(
            file,
            destination,
        );
        const persistedContent = await readFile(destination);
        const expectedHash = createHash("sha256")
            .update(content)
            .digest("hex");

        expect(metadata).toEqual({
            contentHash: expectedHash,
            detectedMime: "application/pdf",
        });
        expect(persistedContent.equals(content)).toBe(true);
        expect(arrayBufferSpy).not.toHaveBeenCalled();
    });
});
