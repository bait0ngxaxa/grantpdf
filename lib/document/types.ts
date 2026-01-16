import { NextResponse } from "next/server";
import { type getServerSession } from "next-auth";

// ============================================================================
// Session Types
// ============================================================================

export interface SessionValidationResult {
    userId: number;
    session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>;
}

// ============================================================================
// Document Types
// ============================================================================

export interface DocumentSaveResult {
    filePath: string;
    relativeStoragePath: string;
}

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

export function isSessionError(
    result: SessionValidationResult | NextResponse
): result is NextResponse {
    return result instanceof NextResponse;
}

export function isProjectError(
    result: ProjectResult | NextResponse
): result is NextResponse {
    return result instanceof NextResponse;
}
