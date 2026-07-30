import { describe, expect, it } from "vitest";
import { createDocumentResponseBody } from "@/lib/document/responseBuilder";

describe("document response storage disclosure", () => {
    it("returns resource identifiers and URLs without the storage path", () => {
        const response = createDocumentResponseBody(41, {
            id: 12,
            name: "โครงการทดสอบ",
            description: null,
        });

        expect(response).toMatchObject({
            success: true,
            fileId: "41",
            downloadUrl: "/api/user-docs/download/41",
            previewUrl: "/api/preview?fileId=41&type=userFile",
        });
        expect(response).not.toHaveProperty("storagePath");
    });
});
