import { describe, expect, it } from "vitest";
import { sanitizeRichTextHtml } from "@/lib/security/htmlSanitizer";

describe("sanitizeRichTextHtml", () => {
    it("removes executable elements and event handlers", () => {
        const result = sanitizeRichTextHtml(
            '<p onclick="alert(1)">ข้อความ</p><script>alert(1)</script><iframe src="/x"></iframe>'
        );

        expect(result).toBe("<p>ข้อความ</p>");
    });

    it("removes unsafe URLs from pasted HTML", () => {
        const result = sanitizeRichTextHtml(
            '<a href="javascript:alert(1)">ลิงก์</a><img src="data:text/html;base64,PHNjcmlwdD4=">'
        );

        expect(result).toBe("<a>ลิงก์</a><img>");
    });

    it("keeps safe formatting while stripping risky inline styles", () => {
        const result = sanitizeRichTextHtml(
            '<p style="font-size:99px; line-height:9; color:red"><strong>หัวข้อ</strong></p><font size="7">เนื้อหา</font>'
        );

        expect(result).toBe(
            '<p style="color: red;"><strong>หัวข้อ</strong></p><font>เนื้อหา</font>'
        );
    });
});
