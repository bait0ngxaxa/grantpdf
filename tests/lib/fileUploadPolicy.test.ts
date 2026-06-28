import { describe, expect, it } from "vitest";
import {
    FILE_UPLOAD,
    getMaxUploadSizeBytesByFileName,
    getMaxUploadSizeMbByFileName,
} from "@/lib/shared/constants";

describe("file upload policy", () => {
    it("caps supported file uploads at 15 MB", () => {
        expect(FILE_UPLOAD.DEFAULT_MAX_SIZE_MB).toBe(15);

        for (const extension of FILE_UPLOAD.ALLOWED_EXTENSIONS) {
            expect(FILE_UPLOAD.MAX_SIZE_MB_BY_EXTENSION[extension]).toBe(15);
        }
    });

    it("resolves max upload size from file extension", () => {
        expect(getMaxUploadSizeMbByFileName("เอกสาร.PDF")).toBe(15);
        expect(getMaxUploadSizeBytesByFileName("เอกสาร.PDF")).toBe(
            15 * 1024 * 1024,
        );
    });
});
