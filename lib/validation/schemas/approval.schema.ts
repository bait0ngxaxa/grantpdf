import { z } from "zod";
import { requiredString, phoneSchema, emailSchema } from "./shared";

export const approvalSchema = z.object({
    head: requiredString("เลขที่หนังสือ"),
    fileName: z.string().trim().optional().default(""),
    projectName: requiredString("ชื่อโครงการ"),
    date: requiredString("วันที่"),
    topicdetail: requiredString("รายละเอียดเรื่อง"),
    todetail: requiredString("รายละเอียดถึง"),
    attachments: z.array(z.string()).default([]),
    detail: requiredString("รายละเอียด"),
    name: requiredString("ชื่อผู้ลงนาม"),
    depart: requiredString("หน่วยงาน"),
    coor: requiredString("ผู้ประสานงาน"),
    tel: phoneSchema,
    email: emailSchema,
    accept: requiredString("ผู้อนุมัติ"),
});

export type ApprovalData = z.infer<typeof approvalSchema>;
