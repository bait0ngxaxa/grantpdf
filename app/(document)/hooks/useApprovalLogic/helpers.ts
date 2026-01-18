/**
 * Convert data URL (base64) to File object
 * Used for canvas signature conversion
 */
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

    return null;
}
