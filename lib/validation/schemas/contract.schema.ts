import { z } from "zod";
import { requiredString, citizenIdSchema } from "./shared";

export const contractSchema = z.object({
    fileName: requiredString("ชื่อไฟล์"),
    projectName: requiredString("ชื่อโครงการ"),
    contractnumber: z.string().trim().optional().default(""),
    projectOffer: requiredString("ข้อเสนอโครงการ"),
    projectCo: requiredString("ชุดโครงการ"),
    owner: requiredString("ผู้รับจ้าง"),
    acceptNum: requiredString("เลขที่ใบสั่งจ้าง"),
    projectCode: requiredString("รหัสโครงการ"),
    cost: requiredString("มูลค่าสัญญา"),
    timelineMonth: requiredString("ระยะเวลา (เดือน)"),
    timelineText: requiredString("ระยะเวลา (ข้อความ)"),
    section: requiredString("งวดงาน"),
    date: requiredString("วันที่ทำสัญญา"),
    name: requiredString("ชื่อผู้รับจ้าง"),
    address: requiredString("ที่อยู่ผู้รับจ้าง"),
    citizenid: citizenIdSchema,
    citizenexpire: requiredString("วันหมดอายุบัตร"),
    witness: requiredString("พยาน"),
});

export type ContractData = z.infer<typeof contractSchema>;
