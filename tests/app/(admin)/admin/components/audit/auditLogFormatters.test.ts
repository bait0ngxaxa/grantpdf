import { describe, expect, it } from "vitest";
import {
    ACTION_OPTIONS,
    formatAuditDetails,
    getActionLabel,
} from "@/app/(admin)/admin/components/audit/auditLogFormatters";

describe("auditLogFormatters", () => {
    it("contains all known actions in ACTION_OPTIONS", () => {
        const expected = [
            "LOGIN_SUCCESS",
            "LOGIN_FAILED",
            "LOGOUT",
            "SESSION_REVOKE",
            "SESSION_REVOKE_OTHERS",
            "SIGNUP",
            "PASSWORD_RESET_REQUEST",
            "PASSWORD_RESET_SUCCESS",
            "PASSWORD_RESET_FAILED",
            "FILE_UPLOAD",
            "FILE_DOWNLOAD",
            "FILE_DELETE",
            "PROJECT_CREATE",
            "PROJECT_UPDATE",
            "PROJECT_DELETE",
            "PROJECT_REPORT_SUBMIT",
            "ADMIN_PROJECT_REPORT_UPDATE",
            "DOCUMENT_GENERATE",
            "ADMIN_USER_DELETE",
            "ADMIN_USER_UPDATE",
            "ADMIN_PROJECT_UPDATE",
            "ADMIN_PROJECT_CO_OWNER_UPDATE",
            "ADMIN_FILE_DOWNLOAD",
        ];

        expect(ACTION_OPTIONS).toEqual(["", ...expected]);
    });

    it("maps every action label and falls back for unknown action", () => {
        expect(getActionLabel("LOGIN_SUCCESS")).toBe("เข้าสู่ระบบสำเร็จ");
        expect(getActionLabel("DOCUMENT_GENERATE")).toBe("สร้างเอกสาร");
        expect(getActionLabel("UNKNOWN_ACTION")).toBe("UNKNOWN_ACTION");
    });

    it("formats login/signup/reset actions", () => {
        expect(formatAuditDetails("LOGIN_SUCCESS", {})).toBe("เข้าสู่ระบบสำเร็จ");
        expect(
            formatAuditDetails("LOGIN_FAILED", {
                attemptedEmail: "user@example.com",
                reason: "rate_limited",
            }),
        ).toContain("ถูกจำกัดจำนวนครั้ง");
        expect(formatAuditDetails("LOGOUT", {})).toBe("ออกจากระบบสำเร็จ");
        expect(formatAuditDetails("SESSION_REVOKE", { revokedCount: 1 })).toBe(
            "ออกจากระบบอุปกรณ์ที่เลือก | จำนวนเซสชันที่ออกจากระบบ: 1",
        );
        expect(
            formatAuditDetails("SESSION_REVOKE_OTHERS", { revokedCount: "3" }),
        ).toBe("ออกจากระบบอุปกรณ์อื่นทั้งหมด | จำนวนเซสชันที่ออกจากระบบ: 3");
        expect(formatAuditDetails("SIGNUP", {})).toBe("สมัครสมาชิกสำเร็จ");
        expect(
            formatAuditDetails("PASSWORD_RESET_REQUEST", {
                requestedEmail: "user@example.com",
                accountFound: true,
            }),
        ).toBe("ส่งคำขอรีเซ็ตรหัสผ่าน | อีเมล: user@example.com");
        expect(
            formatAuditDetails("PASSWORD_RESET_REQUEST", {
                requestedEmail: "missing@example.com",
                accountFound: false,
            }),
        ).toBe(
            "ส่งคำขอรีเซ็ตรหัสผ่าน | อีเมล: missing@example.com | ไม่พบบัญชีในระบบ",
        );
        expect(
            formatAuditDetails("PASSWORD_RESET_REQUEST", {
                attemptedEmail: "rate@example.com",
                reason: "rate_limited",
            }),
        ).toBe(
            "ส่งคำขอรีเซ็ตรหัสผ่าน | อีเมล: rate@example.com | ถูกจำกัดจำนวนครั้ง",
        );
        expect(formatAuditDetails("PASSWORD_RESET_SUCCESS", {})).toBe(
            "รีเซ็ตรหัสผ่านสำเร็จ",
        );
        expect(formatAuditDetails("PASSWORD_RESET_FAILED", {})).toBe(
            "รีเซ็ตรหัสผ่านไม่สำเร็จ",
        );
    });

    it("formats file actions", () => {
        expect(
            formatAuditDetails("FILE_UPLOAD", {
                fileName: "ไฟล์A.pdf",
                projectId: "12",
            }),
        ).toBe("อัปโหลดไฟล์ ไฟล์A.pdf เข้าโครงการ #12");

        expect(
            formatAuditDetails("FILE_DOWNLOAD", {
                fileId: 69,
                fileName: "สัญญา.docx",
                fileType: "userFile",
            }),
        ).toBe("ดาวน์โหลดไฟล์เอกสาร สัญญา.docx (ID: 69)");

        expect(
            formatAuditDetails("ADMIN_FILE_DOWNLOAD", {
                fileId: 3,
                fileName: "แนบ.pdf",
                fileType: "attachment",
            }),
        ).toBe("ดาวน์โหลดไฟล์แนบ แนบ.pdf (ID: 3)");

        expect(
            formatAuditDetails("FILE_DELETE", {
                deletedFileId: "100",
                deletedFileName: "ลบแล้ว.pdf",
            }),
        ).toBe("ลบไฟล์ ลบแล้ว.pdf (ID: 100)");
    });

    it("formats user and project actions", () => {
        expect(
            formatAuditDetails("ADMIN_USER_UPDATE", {
                targetUserEmail: "target@example.com",
                before: { name: "เดิม", role: "member" },
                after: { name: "ใหม่", role: "admin" },
            }),
        ).toBe(
            "แก้ไขข้อมูล target@example.com | ชื่อ: เดิม -> ใหม่ | สิทธิ์: ผู้ใช้งานทั่วไป -> ผู้ดูแลระบบ",
        );

        expect(
            formatAuditDetails("ADMIN_USER_DELETE", {
                targetUserEmail: "remove@example.com",
                deletedUser: { role: "member" },
            }),
        ).toBe("ลบผู้ใช้งาน remove@example.com (สิทธิ์: ผู้ใช้งานทั่วไป)");

        expect(
            formatAuditDetails("PROJECT_CREATE", {
                projectId: 7,
                projectName: "โครงการใหม่",
            }),
        ).toBe("สร้างโครงการ โครงการใหม่ (ID: 7)");

        expect(
            formatAuditDetails("PROJECT_UPDATE", {
                projectId: 7,
                previousName: "เก่า",
                nextName: "ใหม่",
            }),
        ).toBe("โครงการ #7 | ชื่อ: เก่า -> ใหม่");

        expect(
            formatAuditDetails("PROJECT_DELETE", {
                projectId: 8,
                projectName: "โครงการลบ",
            }),
        ).toBe("ลบโครงการ โครงการลบ (ID: 8)");

        expect(
            formatAuditDetails("ADMIN_PROJECT_UPDATE", {
                projectName: "A",
                newStatus: "APPROVED",
                statusNote: "ผ่านแล้ว",
            }),
        ).toBe("อัปเดตโครงการ A | สถานะใหม่: อนุมัติ | หมายเหตุ: ผ่านแล้ว");
    });

    it("formats project report and co-owner actions", () => {
        expect(getActionLabel("PROJECT_REPORT_SUBMIT")).toBe(
            "ส่งรายงานโครงการ",
        );
        expect(getActionLabel("ADMIN_PROJECT_REPORT_UPDATE")).toBe(
            "แอดมินตรวจรายงานโครงการ",
        );
        expect(getActionLabel("ADMIN_PROJECT_CO_OWNER_UPDATE")).toBe(
            "แอดมินอัปเดตเจ้าของร่วมโครงการ",
        );

        expect(
            formatAuditDetails("PROJECT_REPORT_SUBMIT", {
                projectId: "12",
                reportId: "5",
            }),
        ).toBe("ส่งรายงานโครงการ | โครงการ #12 | รายงาน #5");

        expect(
            formatAuditDetails("ADMIN_PROJECT_REPORT_UPDATE", {
                reportId: 5,
                projectId: 12,
                projectName: "โครงการ A",
                status: "อนุมัติแล้ว",
                userEmail: "owner@example.com",
            }),
        ).toBe(
            "ตรวจรายงานโครงการ | โครงการ: โครงการ A | รายงาน #5 | ผลตรวจ: อนุมัติแล้ว | ผู้ส่ง: owner@example.com",
        );

        expect(
            formatAuditDetails("ADMIN_PROJECT_CO_OWNER_UPDATE", {
                projectId: 12,
                allowCoOwners: true,
                adminUserIds: ["2", "3"],
            }),
        ).toBe(
            "อัปเดตเจ้าของร่วมโครงการ | โครงการ #12 | เปิดใช้งานเจ้าของร่วม | ผู้ใช้ที่มอบหมาย: 2, 3",
        );
    });

    it("formats DOCUMENT_GENERATE with thai document type mapping", () => {
        expect(
            formatAuditDetails("DOCUMENT_GENERATE", {
                documentType: "approval",
                replayed: true,
            }),
        ).toBe("ใช้ผลลัพธ์เดิมของการสร้างเอกสาร (หนังสือขออนุมัติ)");

        expect(
            formatAuditDetails("DOCUMENT_GENERATE", {
                documentType: "summary",
                responseStatus: 200,
            }),
        ).toBe("สร้างเอกสาร (สรุปโครงการ) สำเร็จ (สถานะ 200)");

        expect(
            formatAuditDetails("DOCUMENT_GENERATE", {
                documentType: "tor",
                error: "template_error",
            }),
        ).toBe("สร้างเอกสาร (TOR) ไม่สำเร็จ: template_error");
    });

    it("falls back to key-value format for unknown action and detail object", () => {
        expect(
            formatAuditDetails("SOMETHING_NEW", {
                a: "1",
                b: "2",
            }),
        ).toBe("a: 1, b: 2");
    });
});
