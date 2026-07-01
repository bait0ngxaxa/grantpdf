import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const API_ROOT = join(process.cwd(), "app", "api");
const FORBIDDEN_AUTH_IMPORTS = [
    "@/lib/server/auth/session",
    "@/lib/server/auth/grantSession",
] as const;

function findRouteFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) return findRouteFiles(path);
        return entry.isFile() && entry.name === "route.ts" ? [path] : [];
    });
}

function containsForbiddenAuthImport(source: string): boolean {
    return FORBIDDEN_AUTH_IMPORTS.some((modulePath) =>
        source.includes(`from "${modulePath}"`) ||
        source.includes(`from '${modulePath}'`),
    );
}

describe("API auth guard contract", () => {
    it("keeps route handlers behind centralized auth guards", () => {
        const offenders = findRouteFiles(API_ROOT)
            .filter((filePath) =>
                containsForbiddenAuthImport(
                    readFileSync(filePath, { encoding: "utf8" }),
                ),
            )
            .map((filePath) => relative(process.cwd(), filePath));

        expect(offenders).toEqual([]);
    });
});
