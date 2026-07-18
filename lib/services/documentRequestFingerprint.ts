import { createHash } from "node:crypto";

interface IndexedFormEntry {
    name: string;
    value: FormDataEntryValue;
    index: number;
}

interface FormEntryFingerprint {
    index: number;
    name: string;
    kind: "text" | "file";
    value?: string;
    fileName?: string;
    contentType?: string;
    size?: number;
    contentHash?: string;
}

function isFileEntry(value: FormDataEntryValue): value is File {
    return typeof value !== "string";
}

function compareEntries(
    left: FormEntryFingerprint,
    right: FormEntryFingerprint,
): number {
    if (left.name < right.name) return -1;
    if (left.name > right.name) return 1;
    return left.index - right.index;
}

async function fingerprintEntry(
    entry: IndexedFormEntry,
): Promise<FormEntryFingerprint> {
    if (!isFileEntry(entry.value)) {
        return {
            index: entry.index,
            name: entry.name,
            kind: "text",
            value: entry.value,
        };
    }

    const content = Buffer.from(
        await new Response(entry.value).arrayBuffer(),
    );
    const contentHash = createHash("sha256").update(content).digest("hex");

    return {
        index: entry.index,
        name: entry.name,
        kind: "file",
        fileName: entry.value.name,
        contentType: entry.value.type,
        size: entry.value.size,
        contentHash,
    };
}

export async function createDocumentRequestHash(
    formData: FormData,
    context: Readonly<Record<string, string>> = {},
): Promise<string> {
    const formEntries = Array.from(formData.entries())
        .filter(([name]) => name !== "idempotencyKey")
        .map(([name, value], index) => ({ name, value, index }));
    const contextEntries = Object.entries(context).map(([name, value], index) => ({
        name: `context:${name}`,
        value,
        index: formEntries.length + index,
    }));
    const entries = [...formEntries, ...contextEntries];
    const fingerprints = await Promise.all(entries.map(fingerprintEntry));
    fingerprints.sort(compareEntries);
    const canonicalFingerprints = fingerprints.map(
        ({ index: _index, ...fingerprint }) => fingerprint,
    );

    return createHash("sha256")
        .update(JSON.stringify(canonicalFingerprints), "utf8")
        .digest("hex");
}
