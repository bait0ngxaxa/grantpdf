import { z } from "zod";
import {
    requiredString,
    phoneSchema,
    emailSchema,
    requiredBoundedString,
    DOCUMENT_FILE_NAME_MAX_LENGTH,
    PROJECT_NAME_MAX_LENGTH,
} from "./shared";
import { attachmentsSchema } from "./nested.schema";

export const approvalSchema = z.object({
    head: requiredString("เลขที่หนังสือ"),
    fileName: z
        .string()
        .trim()
        .max(DOCUMENT_FILE_NAME_MAX_LENGTH, {
            message: "ชื่อไฟล์ยาวเกินไป",
        })
        .optional()
        .default(""),
    projectName: requiredBoundedString("ชื่อโครงการ", PROJECT_NAME_MAX_LENGTH),
    date: requiredString("วันที่"),
    topicdetail: requiredString("รายละเอียดเรื่อง"),
    todetail: requiredString("รายละเอียดถึง"),
    attachments: attachmentsSchema.default([]),
    detail: requiredString("รายละเอียด"),
    name: requiredString("ชื่อผู้ลงนาม"),
    depart: requiredString("หน่วยงาน"),
    coor: requiredString("ผู้ประสานงาน"),
    tel: phoneSchema,
    email: emailSchema,
    accept: requiredString("ผู้อนุมัติ"),
});

export type ApprovalData = z.infer<typeof approvalSchema>;
