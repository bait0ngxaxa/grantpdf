import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import type { ProjectResolutionOrigin } from "@/lib/services/projectService/types";

export type { ProjectResolutionOrigin } from "@/lib/services/projectService/types";

// ============================================================================
// Document Types
// ============================================================================

export interface DocumentSaveResult {
    filePath: string;
    relativeStoragePath: string;
    resourceId: number | null;
}

export interface DocumentIdempotencyContext {
    complete(
        tx: Prisma.TransactionClient,
        resourceId: number,
        responseBody: Record<string, unknown>,
    ): Promise<void>;
}

export type DocumentRecordCompletion = (
    tx: Prisma.TransactionClient,
    resourceId: number,
) => Promise<void>;

// ============================================================================
// Project Types
// ============================================================================

export interface ProjectResult {
    id: number;
    name: string;
    description: string | null;
}

export interface ProjectResolution {
    project: ProjectResult;
    origin: ProjectResolutionOrigin;
    previousDeletedAt: Date | null;
}

/**
 * DocxModule interface for docxtemplater modules (e.g., ImageModule).
 * Based on the common module pattern used by docxtemplater plugins.
 */
export interface DocxModule {
    optionsRecursive?: Record<string, unknown>;
    options?: Record<string, unknown>;
    getImage?: (tag: string) => Buffer | Promise<Buffer> | null;
    getSize?: (image: Buffer, tag?: string) => [number, number];
    centered?: boolean;
    [key: string]: unknown;
}

export interface DocxParserOptions {
    textareaFields?: string[];
    modules?: DocxModule[];
    customNullGetter?: (part: { value: string }) => string;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isProjectError(
    result: ProjectResolution | NextResponse,
): result is NextResponse {
    return result instanceof NextResponse;
}
