import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const modelsWithAutomaticUpdatedAt = [
    "User",
    "Program",
    "Project",
    "UserFile",
    "AttachmentFile",
    "ContractCounter",
] as const;

function getModelBlock(schema: string, modelName: string): string {
    const match = schema.match(
        new RegExp(`model ${modelName} \\{([\\s\\S]*?)\\n\\}`),
    );

    if (!match) {
        throw new Error(`Missing Prisma model: ${modelName}`);
    }

    return match[1];
}

describe("Prisma updated_at fields", () => {
    it("updates timestamps automatically for mutable models", async () => {
        const schema = await readFile(
            resolve(process.cwd(), "prisma/schema.prisma"),
            "utf8",
        );

        for (const modelName of modelsWithAutomaticUpdatedAt) {
            expect(getModelBlock(schema, modelName)).toMatch(
                /updated_at\s+DateTime\?\s+@updatedAt/,
            );
        }
    });
});
