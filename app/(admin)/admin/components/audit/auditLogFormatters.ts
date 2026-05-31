const ACTION_LABELS = {
    LOGIN_SUCCESS: "เข้าสู่ระบบสำเร็จ",
    LOGIN_FAILED: "เข้าสู่ระบบไม่สำเร็จ",
    LOGOUT: "ออกจากระบบ",
    SESSION_REVOKE: "ออกจากระบบอุปกรณ์ที่เลือก",
    SESSION_REVOKE_OTHERS: "ออกจากระบบอุปกรณ์อื่นทั้งหมด",
    SIGNUP: "สมัครสมาชิก",
    PASSWORD_RESET_REQUEST: "ขอรีเซ็ตรหัสผ่าน",
    PASSWORD_RESET_SUCCESS: "รีเซ็ตรหัสผ่านสำเร็จ",
    PASSWORD_RESET_FAILED: "รีเซ็ตรหัสผ่านไม่สำเร็จ",
    FILE_UPLOAD: "อัปโหลดไฟล์",
    FILE_DOWNLOAD: "ดาวน์โหลดไฟล์",
    FILE_DELETE: "ลบไฟล์",
    PROJECT_CREATE: "สร้างโครงการ",
    PROJECT_UPDATE: "อัปเดตโครงการ",
    PROJECT_DELETE: "ลบโครงการ",
    PROJECT_REPORT_SUBMIT: "ส่งรายงานโครงการ",
    ADMIN_PROJECT_REPORT_UPDATE: "แอดมินตรวจรายงานโครงการ",
    DOCUMENT_GENERATE: "สร้างเอกสาร",
    ADMIN_USER_DELETE: "แอดมินลบผู้ใช้งาน",
    ADMIN_USER_UPDATE: "แอดมินแก้ไขผู้ใช้งาน",
    ADMIN_PROJECT_UPDATE: "แอดมินอัปเดตโครงการ",
    ADMIN_PROJECT_CO_OWNER_UPDATE: "แอดมินอัปเดตเจ้าของร่วมโครงการ",
    ADMIN_FILE_DOWNLOAD: "แอดมินดาวน์โหลดไฟล์",
} as const;

type KnownAction = keyof typeof ACTION_LABELS;
export const ACTION_OPTIONS = ["", ...Object.keys(ACTION_LABELS)];

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    tor: "TOR",
    approval: "หนังสือขออนุมัติ",
    contract: "สัญญาจ้าง",
    formproject: "แบบฟอร์มข้อเสนอโครงการ",
    summary: "สรุปโครงการ",
};

const ROLE_LABELS: Record<string, string> = {
    admin: "ผู้ดูแลระบบ",
    member: "ผู้ใช้งานทั่วไป",
};

const STATUS_LABELS: Record<string, string> = {
    IN_PROGRESS: "กำลังดำเนินการ",
    APPROVED: "อนุมัติ",
    REJECTED: "ไม่อนุมัติ",
    EDIT: "แก้ไข",
    CLOSED: "ปิดโครงการ",
};

const LOGIN_REASON_LABELS: Record<string, string> = {
    rate_limited: "ถูกจำกัดจำนวนครั้งในการลองเข้าสู่ระบบ",
    invalid_credentials: "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง",
};

function mapDocumentType(value: string | null): string {
    if (!value) return "เอกสาร";
    return DOCUMENT_TYPE_LABELS[value] || value;
}

function mapRole(value: string | null): string | null {
    if (!value) return null;
    return ROLE_LABELS[value] || value;
}

function mapStatus(value: string | null): string | null {
    if (!value) return null;
    return STATUS_LABELS[value] || value;
}

function mapLoginReason(value: string | null): string {
    if (!value) return "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง";
    return LOGIN_REASON_LABELS[value] || "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง";
}

function formatRevokedCount(count: number | null): string | null {
    if (count === null) return null;
    return `จำนวนเซสชันที่ออกจากระบบ: ${count}`;
}

function readStringField(
    data: Record<string, unknown>,
    key: string,
): string | null {
    const value = data[key];
    return typeof value === "string" && value.trim() ? value : null;
}

function readNumberField(
    data: Record<string, unknown>,
    key: string,
): number | null {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
}

function readObjectField(
    data: Record<string, unknown>,
    key: string,
): Record<string, unknown> | null {
    const value = data[key];
    if (!value || Array.isArray(value) || typeof value !== "object") {
        return null;
    }
    return value as Record<string, unknown>;
}

function readArrayField(
    data: Record<string, unknown>,
    key: string,
): unknown[] {
    const value = data[key];
    return Array.isArray(value) ? value : [];
}

function formatKeyValueDetails(details: Record<string, unknown>): string {
    const entries = Object.entries(details)
        .map(([key, value]) => `${key}: ${String(value)}`)
        .slice(0, 3);

    if (entries.length === 0) return "-";
    const text = entries.join(", ");
    return text.length > 160 ? `${text.slice(0, 160)}...` : text;
}

export function getActionLabel(action: string): string {
    if (action in ACTION_LABELS) {
        return ACTION_LABELS[action as KnownAction];
    }
    return action;
}

export function formatAuditDateTime(value: string): string {
    return new Date(value).toLocaleString("th-TH");
}

export function formatAuditDetails(
    action: string,
    details: Record<string, unknown> | null,
): string {
    const knownAction = action as KnownAction;
    if (!details) return "-";

    if (knownAction === "ADMIN_USER_UPDATE") {
        const email = readStringField(details, "targetUserEmail") ?? "ผู้ใช้งาน";
        const before = readObjectField(details, "before");
        const after = readObjectField(details, "after");
        const beforeRole = before ? readStringField(before, "role") : null;
        const afterRole = after ? readStringField(after, "role") : null;
        const beforeName = before ? readStringField(before, "name") : null;
        const afterName = after ? readStringField(after, "name") : null;

        const parts: string[] = [`แก้ไขข้อมูล ${email}`];
        if (beforeName && afterName && beforeName !== afterName) {
            parts.push(`ชื่อ: ${beforeName} -> ${afterName}`);
        }
        if (beforeRole && afterRole && beforeRole !== afterRole) {
            parts.push(`สิทธิ์: ${mapRole(beforeRole)} -> ${mapRole(afterRole)}`);
        }
        return parts.join(" | ");
    }

    if (knownAction === "ADMIN_USER_DELETE") {
        const email = readStringField(details, "targetUserEmail");
        const deletedUser = readObjectField(details, "deletedUser");
        const role = deletedUser ? readStringField(deletedUser, "role") : null;
        const roleText = role ? ` (สิทธิ์: ${mapRole(role)})` : "";
        return email
            ? `ลบผู้ใช้งาน ${email}${roleText}`
            : "ลบผู้ใช้งานออกจากระบบ";
    }

    if (knownAction === "LOGIN_FAILED") {
        const attemptedEmail = readStringField(details, "attemptedEmail");
        const reason = readStringField(details, "reason");
        const reasonLabel = mapLoginReason(reason);
        return attemptedEmail
            ? `เข้าสู่ระบบไม่สำเร็จสำหรับ ${attemptedEmail} (${reasonLabel})`
            : `เข้าสู่ระบบไม่สำเร็จ (${reasonLabel})`;
    }

    if (knownAction === "LOGIN_SUCCESS") {
        return "เข้าสู่ระบบสำเร็จ";
    }

    if (knownAction === "LOGOUT") {
        return "ออกจากระบบสำเร็จ";
    }

    if (knownAction === "SESSION_REVOKE") {
        const revokedCount = formatRevokedCount(
            readNumberField(details, "revokedCount"),
        );
        return revokedCount
            ? `ออกจากระบบอุปกรณ์ที่เลือก | ${revokedCount}`
            : "ออกจากระบบอุปกรณ์ที่เลือก";
    }

    if (knownAction === "SESSION_REVOKE_OTHERS") {
        const revokedCount = formatRevokedCount(
            readNumberField(details, "revokedCount"),
        );
        return revokedCount
            ? `ออกจากระบบอุปกรณ์อื่นทั้งหมด | ${revokedCount}`
            : "ออกจากระบบอุปกรณ์อื่นทั้งหมด";
    }

    if (knownAction === "SIGNUP") {
        return "สมัครสมาชิกสำเร็จ";
    }

    if (knownAction === "PASSWORD_RESET_REQUEST") {
        const requestedEmail =
            readStringField(details, "requestedEmail") ||
            readStringField(details, "attemptedEmail");
        const accountFound = details.accountFound;
        const reason = readStringField(details, "reason");
        const parts: string[] = ["ส่งคำขอรีเซ็ตรหัสผ่าน"];

        if (requestedEmail) {
            parts.push(`อีเมล: ${requestedEmail}`);
        }
        if (accountFound === false) {
            parts.push("ไม่พบบัญชีในระบบ");
        }
        if (reason === "rate_limited") {
            parts.push("ถูกจำกัดจำนวนครั้ง");
        }

        return parts.join(" | ");
    }

    if (knownAction === "PASSWORD_RESET_SUCCESS") {
        return "รีเซ็ตรหัสผ่านสำเร็จ";
    }

    if (knownAction === "PASSWORD_RESET_FAILED") {
        return "รีเซ็ตรหัสผ่านไม่สำเร็จ";
    }

    if (knownAction === "FILE_UPLOAD") {
        const fileName = readStringField(details, "fileName");
        const projectId = readNumberField(details, "projectId");
        if (fileName && projectId !== null) {
            return `อัปโหลดไฟล์ ${fileName} เข้าโครงการ #${projectId}`;
        }
        return fileName ? `อัปโหลดไฟล์ ${fileName}` : "อัปโหลดไฟล์";
    }

    if (
        knownAction === "FILE_DOWNLOAD" ||
        knownAction === "ADMIN_FILE_DOWNLOAD"
    ) {
        const fileName = readStringField(details, "fileName");
        const fileType = readStringField(details, "fileType");
        const fileId = readNumberField(details, "fileId");
        const typeLabel =
            fileType === "attachment"
                ? "ไฟล์แนบ"
                : fileType === "userFile"
                  ? "ไฟล์เอกสาร"
                  : "ไฟล์";

        if (fileName && fileId !== null) {
            return `ดาวน์โหลด${typeLabel} ${fileName} (ID: ${fileId})`;
        }
        if (fileName) {
            return `ดาวน์โหลด${typeLabel} ${fileName}`;
        }
        if (fileId !== null) {
            return `ดาวน์โหลด${typeLabel} (ID: ${fileId})`;
        }
        return "ดาวน์โหลดไฟล์";
    }

    if (knownAction === "FILE_DELETE") {
        const fileName =
            readStringField(details, "deletedFileName") ||
            readStringField(details, "fileName");
        const fileId =
            readNumberField(details, "deletedFileId") ||
            readNumberField(details, "fileId");
        if (fileName && fileId !== null) {
            return `ลบไฟล์ ${fileName} (ID: ${fileId})`;
        }
        return fileName ? `ลบไฟล์ ${fileName}` : "ลบไฟล์";
    }

    if (knownAction === "PROJECT_CREATE") {
        const projectName = readStringField(details, "projectName");
        const projectId = readNumberField(details, "projectId");
        if (projectName && projectId !== null) {
            return `สร้างโครงการ ${projectName} (ID: ${projectId})`;
        }
        return projectName ? `สร้างโครงการ ${projectName}` : "สร้างโครงการ";
    }

    if (knownAction === "PROJECT_UPDATE") {
        const projectId = readNumberField(details, "projectId");
        const previousName = readStringField(details, "previousName");
        const nextName = readStringField(details, "nextName");
        const parts: string[] = [];

        if (projectId !== null) {
            parts.push(`โครงการ #${projectId}`);
        }
        if (previousName && nextName && previousName !== nextName) {
            parts.push(`ชื่อ: ${previousName} -> ${nextName}`);
        }
        return parts.length > 0 ? parts.join(" | ") : "อัปเดตข้อมูลโครงการ";
    }

    if (knownAction === "PROJECT_DELETE") {
        const projectName = readStringField(details, "projectName");
        const projectId = readNumberField(details, "projectId");
        if (projectName && projectId !== null) {
            return `ลบโครงการ ${projectName} (ID: ${projectId})`;
        }
        return projectName ? `ลบโครงการ ${projectName}` : "ลบโครงการ";
    }

    if (knownAction === "PROJECT_REPORT_SUBMIT") {
        const projectId = readNumberField(details, "projectId");
        const reportId = readNumberField(details, "reportId");
        const parts: string[] = ["ส่งรายงานโครงการ"];

        if (projectId !== null) {
            parts.push(`โครงการ #${projectId}`);
        }
        if (reportId !== null) {
            parts.push(`รายงาน #${reportId}`);
        }
        return parts.join(" | ");
    }

    if (knownAction === "ADMIN_PROJECT_REPORT_UPDATE") {
        const projectName = readStringField(details, "projectName");
        const projectId = readNumberField(details, "projectId");
        const reportId = readNumberField(details, "reportId");
        const status = readStringField(details, "status");
        const userEmail = readStringField(details, "userEmail");
        const parts: string[] = ["ตรวจรายงานโครงการ"];

        if (projectName) {
            parts.push(`โครงการ: ${projectName}`);
        } else if (projectId !== null) {
            parts.push(`โครงการ #${projectId}`);
        }
        if (reportId !== null) {
            parts.push(`รายงาน #${reportId}`);
        }
        if (status) {
            parts.push(`ผลตรวจ: ${status}`);
        }
        if (userEmail) {
            parts.push(`ผู้ส่ง: ${userEmail}`);
        }
        return parts.join(" | ");
    }

    if (knownAction === "DOCUMENT_GENERATE") {
        const documentType = readStringField(details, "documentType");
        const replayed = details.replayed === true;
        const responseStatus = readNumberField(details, "responseStatus");
        const error = readStringField(details, "error");
        const typeLabel = mapDocumentType(documentType);

        if (replayed) {
            return `ใช้ผลลัพธ์เดิมของการสร้างเอกสาร (${typeLabel})`;
        }
        if (error) {
            return `สร้างเอกสาร (${typeLabel}) ไม่สำเร็จ: ${error}`;
        }
        if (responseStatus !== null) {
            return `สร้างเอกสาร (${typeLabel}) สำเร็จ (สถานะ ${responseStatus})`;
        }
        return `สร้างเอกสาร (${typeLabel})`;
    }

    if (knownAction === "ADMIN_PROJECT_UPDATE") {
        const projectName = readStringField(details, "projectName");
        const newStatus = readStringField(details, "newStatus");
        const statusNote = readStringField(details, "statusNote");
        const parts: string[] = [];

        if (projectName) {
            parts.push(`อัปเดตโครงการ ${projectName}`);
        } else {
            parts.push("อัปเดตสถานะโครงการ");
        }
        if (newStatus) {
            parts.push(`สถานะใหม่: ${mapStatus(newStatus)}`);
        }
        if (statusNote) {
            parts.push(`หมายเหตุ: ${statusNote}`);
        }
        return parts.join(" | ");
    }

    if (knownAction === "ADMIN_PROJECT_CO_OWNER_UPDATE") {
        const projectId = readNumberField(details, "projectId");
        const allowCoOwners = details.allowCoOwners === true;
        const adminUserIds = readArrayField(details, "adminUserIds")
            .map((value) => String(value))
            .filter((value) => value.trim().length > 0);
        const parts: string[] = ["อัปเดตเจ้าของร่วมโครงการ"];

        if (projectId !== null) {
            parts.push(`โครงการ #${projectId}`);
        }
        parts.push(allowCoOwners ? "เปิดใช้งานเจ้าของร่วม" : "ปิดใช้งานเจ้าของร่วม");
        if (adminUserIds.length > 0) {
            parts.push(`ผู้ใช้ที่มอบหมาย: ${adminUserIds.join(", ")}`);
        }
        return parts.join(" | ");
    }

    return formatKeyValueDetails(details);
}
