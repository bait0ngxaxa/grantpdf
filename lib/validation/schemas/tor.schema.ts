import { z } from "zod";
import { requiredString, phoneSchema, emailSchema } from "./shared";

export const torSchema = z.object({
    projectName: requiredString("ชื่อโครงการ"),
    fileName: requiredString("ชื่อไฟล์"),
    owner: requiredString("ผู้รับผิดชอบ"),
    address: requiredString("ที่อยู่"),
    email: emailSchema,
    tel: phoneSchema,
    timeline: requiredString("ระยะเวลา"),
    contractnumber: requiredString("เลขที่สัญญา"),
    cost: requiredString("งบประมาณ"),
    topic1: requiredString("หัวข้อ"),
    objective1: requiredString("วัตถุประสงค์ 1"),
    target: requiredString("กลุ่มเป้าหมาย"),
    zone: requiredString("พื้นที่ดำเนินการ"),
    plan: requiredString("แผนการดำเนินงาน"),
    projectmanage: requiredString("การบริหารจัดการ"),
    partner: requiredString("ภาคีร่วม"),
    date: requiredString("วันที่"),
});

export type TORData = z.infer<typeof torSchema>;
