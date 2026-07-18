import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { Readable, Transform, type TransformCallback } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileTypeStream } from "file-type";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";

class HashingTransform extends Transform {
    private readonly hash = createHash("sha256");

    public getDigest(): string {
        return this.hash.digest("hex");
    }

    public _transform(
        chunk: Buffer,
        _encoding: BufferEncoding,
        callback: TransformCallback,
    ): void {
        this.hash.update(chunk);
        callback(null, chunk);
    }
}

export interface StreamedFileMetadata {
    contentHash: string;
    detectedMime: string | undefined;
}

export async function streamFileToPath(
    file: File,
    destinationPath: string,
): Promise<StreamedFileMetadata> {
    const detectionStream = await fileTypeStream(
        file.stream() as unknown as NodeReadableStream<Uint8Array>,
        { sampleSize: 4100 },
    );
    const detectedMime = detectionStream.fileType?.mime;
    const nodeDetectionStream = Readable.fromWeb(
        detectionStream as unknown as NodeReadableStream<Uint8Array>,
    );
    const hashingStream = new HashingTransform();

    try {
        await pipeline(
            nodeDetectionStream,
            hashingStream,
            createWriteStream(destinationPath, { flags: "wx" }),
        );
    } catch (error: unknown) {
        await unlink(destinationPath).catch(() => undefined);
        throw error;
    }

    return {
        contentHash: hashingStream.getDigest(),
        detectedMime,
    };
}
