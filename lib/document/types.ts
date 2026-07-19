import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

// ============================================================================
// Document Types
// ============================================================================

export interface DocumentSaveResult {
    filePath: string;
    relativeStoragePath: string;
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
    relativeStoragePath: string,
) => Promise<void>;

// ============================================================================
// Project Types
// ============================================================================

export interface ProjectResult {
    id: number;
    name: string;
    description: string | null;
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
    result: ProjectResult | NextResponse,
): result is NextResponse {
    return result instanceof NextResponse;
}
