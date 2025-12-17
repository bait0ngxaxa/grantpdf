import { v4 as uuidv4 } from "uuid";

export const fixThaiDistributed = (text: string): string => {
    if (!text || typeof text !== "string") return "";

    return (
        text
            // 1. ลบ invisible characters ที่ทำให้ Thai Distributed ทำงานผิด
            .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero-width chars + BOM
            .replace(/[\u2060-\u206F]/g, "") // Word joiner, invisible chars
            .replace(/\u00AD/g, "") // Soft hyphen (ปัญหาหลัก!)
            .replace(/[\u034F\u061C]/g, "") // Combining grapheme joiner + Arabic letter mark

            // 2. แปลง special spaces เป็น normal space
            .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ")

            // 3. รวม Thai combining characters
            .normalize("NFC")

            // 4. จัดการ line breaks อย่างถูกต้อง (รักษา paragraph structure)
            .replace(/\r\n|\r|\u2028/g, "\n") // แปลงเป็น LF
            .replace(/\u2029/g, "\n\n") // Paragraph separator
            .replace(/[\u000B\u000C]/g, "\n") // Vertical tab, Form feed

            // 5. **ปรับปรุงการจัดการ spaces สำหรับ Thai Distributed**
            .replace(/[ \t]{2,}/g, " ") // แปลง multiple spaces เป็น single space
            .replace(/^[ \t]+|[ \t]+$/gm, "") // ลบ leading/trailing spaces ในแต่ละบรรทัด

            // 6. ลบ Word field codes และ formatting marks
            .replace(/[\u0013-\u0015]/g, "") // Field separators
            .replace(/[\u200E\u200F\u202A-\u202E]/g, "") // Directional marks

            // 7. **เพิ่มการจัดการ Thai-specific issues**
            .replace(/([ก-๏])\s+([ก-๏])/g, "$1 $2") // รักษาช่องว่างระหว่างคำไทย
            .replace(/\s*([.,:;!?])\s*/g, "$1 ") // จัดการเครื่องหมายวรรคตอน

            // 8. จำกัด empty lines และ clean up
            .replace(/\n{3,}/g, "\n\n") // จำกัด empty lines
            .replace(/^\n+|\n+$/g, "") // ลบ leading/trailing newlines
            .trim()
    );
};

export const generateUniqueFilename = (originalName: string): string => {
    const lastDotIndex = originalName.lastIndexOf(".");
    const nameWithoutExt =
        lastDotIndex > 0
            ? originalName.substring(0, lastDotIndex)
            : originalName;
    const extension =
        lastDotIndex > 0 ? originalName.substring(lastDotIndex) : "";

    // ทำความสะอาดชื่อไฟล์โดยเก็บอักขระไทยไว้
    const sanitizedName = nameWithoutExt
        .replace(/\s+/g, "_") // เปลี่ยนช่องว่างเป็น underscore
        .replace(/[<>:"/\\|?*]/g, "") // ลบอักขระที่ไม่อนุญาตใน filename เท่านั้น
        .substring(0, 50); // จำกัดความยาว

    const uniqueId = uuidv4();
    return `${uniqueId}_${sanitizedName}${extension}`;
};

export const getMimeType = (fileExtension: string): string => {
    const ext = fileExtension.toLowerCase();
    switch (ext) {
        case "pdf":
            return "application/pdf";
        case "doc":
            return "application/msword";
        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "gif":
            return "image/gif";
        case "txt":
            return "text/plain";
        case "xls":
            return "application/vnd.ms-excel";
        case "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case "ppt":
            return "application/vnd.ms-powerpoint";
        case "pptx":
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        case "zip":
            return "application/zip";
        case "rar":
            return "application/x-rar-compressed";
        default:
            return "application/octet-stream";
    }
};

export default fixThaiDistributed;
