import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { fixThaiDistributed } from "./utils";
import type { DocxParserOptions } from "./types";

export function createDocxRenderer(
    templateBuffer: Buffer,
    options: DocxParserOptions = {}
): Docxtemplater {
    const { textareaFields = [], modules = [], customNullGetter } = options;

    const zip = new PizZip(templateBuffer);

    return new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
            start: "{",
            end: "}",
        },
        modules,
        nullGetter:
            customNullGetter ||
            function (_part) {
                return "";
            },
        parser: function (tag) {
            return {
                get: function (
                    scope: Record<string, unknown>,
                    _context: unknown
                ) {
                    if (tag === ".") {
                        return scope;
                    }

                    const rawValue = scope[tag];
                    if (typeof rawValue === "string" && rawValue.trim()) {
                        // Fix Thai formatting for all fields
                        let value = fixThaiDistributed(rawValue);

                        // Handle textarea fields - convert line breaks
                        if (textareaFields.includes(tag)) {
                            value = value.replace(/\n/g, "\r\n");
                        }
                        return value;
                    }
                    return rawValue || "";
                },
            };
        },
    });
}

/**
 * Load template file from public directory.
 */
export async function loadTemplate(
    templateName: string,
    fallbackTemplate?: string
): Promise<Buffer> {
    const templatePath = path.join(process.cwd(), "public", templateName);

    try {
        return await fs.readFile(templatePath);
    } catch (_error) {
        if (fallbackTemplate) {
            const fallbackPath = path.join(
                process.cwd(),
                "public",
                fallbackTemplate
            );
            return await fs.readFile(fallbackPath);
        }
        throw _error;
    }
}
