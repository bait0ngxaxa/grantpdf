// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createDocumentRequestHash } from "@/lib/services/documentRequestFingerprint";

function createFormData(
    projectId: string,
    fileContents: string,
    idempotencyKey: string,
): FormData {
    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set(
        "attachment",
        new File([fileContents], "source.pdf", { type: "application/pdf" }),
    );
    formData.set("idempotencyKey", idempotencyKey);
    return formData;
}

describe("createDocumentRequestHash", () => {
    it("is stable when equivalent fields arrive in a different order", async () => {
        const first = createFormData("project-1", "file-a", "key-a");
        const second = new FormData();
        second.set("idempotencyKey", "key-b");
        second.set(
            "attachment",
            new File(["file-a"], "source.pdf", { type: "application/pdf" }),
        );
        second.set("projectId", "project-1");

        const firstHash = await createDocumentRequestHash(first);
        const secondHash = await createDocumentRequestHash(second);

        expect(firstHash).toBe(secondHash);
    });

    it("changes when the project changes", async () => {
        const firstHash = await createDocumentRequestHash(
            createFormData("project-1", "file-a", "key-a"),
        );
        const secondHash = await createDocumentRequestHash(
            createFormData("project-2", "file-a", "key-b"),
        );

        expect(firstHash).not.toBe(secondHash);
    });

    it("changes when the route context project changes", async () => {
        const formData = createFormData("project-1", "file-a", "key-a");
        const firstHash = await createDocumentRequestHash(formData, {
            projectId: "1",
        });
        const secondHash = await createDocumentRequestHash(formData, {
            projectId: "2",
        });

        expect(firstHash).not.toBe(secondHash);
    });

    it("changes when file content changes", async () => {
        const firstHash = await createDocumentRequestHash(
            createFormData("project-1", "file-a", "key-a"),
        );
        const secondHash = await createDocumentRequestHash(
            createFormData("project-1", "file-b", "key-b"),
        );

        expect(firstHash).not.toBe(secondHash);
    });

    it("does not include the idempotency key in the request hash", async () => {
        const firstHash = await createDocumentRequestHash(
            createFormData("project-1", "file-a", "key-a"),
        );
        const secondHash = await createDocumentRequestHash(
            createFormData("project-1", "file-a", "key-b"),
        );

        expect(firstHash).toBe(secondHash);
    });
});
