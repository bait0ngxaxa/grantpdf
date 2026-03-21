import { z } from "zod";
import { requiredString } from "./shared";

export const summarySchema = z.object({
    fileName: requiredString("ชื่อไฟล์"),
    projectName: requiredString("ชื่อโครงการ"),
    contractNumber: requiredString("เลขที่สัญญา"),
    organize: requiredString("หน่วยงานที่เสนอโครงการ"),
    projectOwner: requiredString("ผู้เสนอโครงการ"),
    projectReview: requiredString("ผู้ทบทวนโครงการ"),
    inspector: z.string().trim().optional().default(""),
    coordinator: requiredString("ผู้ประสานงาน"),
    projectCode: requiredString("รหัสชุดโครงการ"),
    projectActivity: requiredString("รหัสภายใต้กิจกรรม"),
    projectNhf: requiredString("เลขที่ มสช น."),
    projectCo: requiredString("ชุดโครงการ"),
    month: requiredString("ระยะเวลาดำเนินการ"),
    timeline: requiredString("ระยะเวลา"),
    sec1: requiredString("งวด 1"),
    sec2: requiredString("งวด 2"),
    sec3: requiredString("งวด 3"),
    sum: requiredString("รวม"),
    funds: requiredString("แหล่งทุน"),
});

export type SummaryData = z.infer<typeof summarySchema>;
