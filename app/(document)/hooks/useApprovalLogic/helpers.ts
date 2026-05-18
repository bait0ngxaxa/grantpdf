/**
 * Convert data URL (base64) to File object
 * Used for canvas signature conversion
 */
export const SIGNATURE_ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
] as const;

export const SIGNATURE_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export function isAllowedSignatureMimeType(mimeType: string): boolean {
    return SIGNATURE_ALLOWED_MIME_TYPES.includes(
        mimeType as (typeof SIGNATURE_ALLOWED_MIME_TYPES)[number],
    );
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("ไม่สามารถอ่านไฟล์ภาพลายเซ็นได้"));
        };
        image.src = objectUrl;
    });
}

async function canvasToJpegBlob(
    canvas: HTMLCanvasElement,
    quality: number,
): Promise<Blob | null> {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
    });
}

function drawResizedSignatureToCanvas(
    image: HTMLImageElement,
    width: number,
    height: number,
): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("ไม่สามารถประมวลผลภาพลายเซ็นได้");
    }

    // Use white background to avoid transparent artifacts after JPEG encoding.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas;
}

export async function optimizeSignatureImageFile(file: File): Promise<File> {
    const image = await loadImageFromFile(file);

    const maxWidth = 800;
    const maxHeight = 400;
    const widthRatio = maxWidth / image.width;
    const heightRatio = maxHeight / image.height;
    const scale = Math.min(widthRatio, heightRatio, 1);

    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    let workingWidth = targetWidth;
    let workingHeight = targetHeight;
    let quality = 0.82;
    let blob: Blob | null = null;
    let attempts = 0;

    while (attempts < 8) {
        const canvas = drawResizedSignatureToCanvas(
            image,
            workingWidth,
            workingHeight,
        );
        blob = await canvasToJpegBlob(canvas, quality);

        if (!blob) {
            break;
        }

        if (blob.size <= SIGNATURE_MAX_SIZE_BYTES) {
            break;
        }

        if (quality > 0.56) {
            quality = Math.max(0.56, quality - 0.08);
        } else {
            workingWidth = Math.max(240, Math.round(workingWidth * 0.85));
            workingHeight = Math.max(120, Math.round(workingHeight * 0.85));
        }
        attempts += 1;
    }

    if (!blob) {
        throw new Error("ไม่สามารถบีบอัดไฟล์ลายเซ็นได้");
    }

    const originalName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${originalName || "signature"}.jpg`, {
        type: "image/jpeg",
    });
}

export function dataURLtoFile(dataURL: string, filename: string): File | null {
    try {
        if (!dataURL.startsWith("data:image/")) {
            throw new Error("Invalid signature data format");
        }

        const parts = dataURL.split(",");
        if (parts.length !== 2) {
            throw new Error("Invalid base64 data structure");
        }

        const byteString = atob(parts[1]);
        const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const file = new File([ab], filename, { type: mimeString });

        if (file.size === 0) {
            throw new Error("Generated signature file is empty");
        }

        return file;
    } catch (error) {
        console.error("Error converting data URL to file:", error);
        return null;
    }
}

/**
 * Validate attachment consistency
 * Returns error message if validation fails, null if valid
 */
export function validateAttachments(
    attachments: string[],
    attachmentFiles: File[],
): string | null {
    const totalTextFields = attachments.length;
    const nonEmptyAttachments = attachments.filter((a) => a.trim() !== "");
    const attachmentTextCount = nonEmptyAttachments.length;
    const attachmentFileCount = attachmentFiles.length;

    // Case 1: มีช่องกรอกค่าบางช่องว่างเปล่า (และมีไฟล์อัปโหลดอยู่)
    if (attachmentFileCount > 0 && totalTextFields > attachmentTextCount) {
        const emptyCount = totalTextFields - attachmentTextCount;
        return `มีช่องรายละเอียด 'สิ่งที่ส่งมาด้วย' ว่างอยู่ ${emptyCount} ช่อง กรุณากรอกให้ครบหรือลบช่องที่ไม่ใช้`;
    }

    // Case 2: มีรายละเอียดแต่ไม่มีไฟล์
    if (attachmentTextCount > 0 && attachmentFileCount === 0) {
        return "กรุณาอัปโหลดไฟล์แนบสำหรับรายการ 'สิ่งที่ส่งมาด้วย' ที่กรอกไว้";
    }

    // Case 3: มีไฟล์แต่ไม่มีรายละเอียด
    if (attachmentFileCount > 0 && attachmentTextCount === 0) {
        return "กรุณากรอกรายละเอียด 'สิ่งที่ส่งมาด้วย' สำหรับไฟล์แนบที่อัปโหลดไว้";
    }

    // Case 4: จำนวนไม่ตรงกัน
    if (
        attachmentTextCount > 0 &&
        attachmentFileCount > 0 &&
        attachmentTextCount !== attachmentFileCount
    ) {
        return `จำนวนรายการ 'สิ่งที่ส่งมาด้วย' (${attachmentTextCount} รายการ) ไม่ตรงกับจำนวนไฟล์แนบ (${attachmentFileCount} ไฟล์) กรุณาให้จำนวนตรงกัน`;
    }

    return null;
}

/**
 * Validate signature
 * Returns error message if validation fails, null if valid
 */
export function validateSignature(
    signatureFile: File | null,
    signatureCanvasData: string | null,
): string | null {
    if (signatureFile && signatureCanvasData) {
        return "กรุณาเลือกเพียงวิธีการหนึ่งในการเพิ่มลายเซ็น (อัปโหลดไฟล์ หรือ วาดลายเซ็นเอง)";
    }

    if (!signatureFile && !signatureCanvasData) {
        return "กรุณาเพิ่มลายเซ็นโดยการอัปโหลดไฟล์ หรือ วาดลายเซ็นบนหน้าจอ";
    }

    if (signatureFile) {
        if (!isAllowedSignatureMimeType(signatureFile.type)) {
            return "ไฟล์ลายเซ็นต้องเป็น PNG หรือ JPEG เท่านั้น";
        }

        if (signatureFile.size > SIGNATURE_MAX_SIZE_BYTES) {
            return "ไฟล์ลายเซ็นมีขนาดใหญ่เกินไป (สูงสุด 10MB)";
        }
    }

    return null;
}
