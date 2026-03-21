import { z } from "zod";
import { requiredString, phoneSchema, emailSchema } from "./shared";

export const formProjectSchema = z.object({
    fileName: requiredString("ชื่อไฟล์"),
    projectName: requiredString("ชื่อโครงการ"),
    person: requiredString("ผู้รับผิดชอบ"),
    address: requiredString("ที่อยู่"),
    tel: phoneSchema,
    email: emailSchema,
    timeline: requiredString("ระยะเวลา"),
    cost: requiredString("งบประมาณ"),
    rationale: requiredString("หลักการและเหตุผล"),
    objective: requiredString("วัตถุประสงค์"),
    goal: requiredString("เป้าหมาย"),
    target: requiredString("กลุ่มเป้าหมาย"),
    product: requiredString("ผลผลิต"),
    scope: requiredString("ขอบเขตงาน"),
    result: requiredString("ผลลัพธ์"),
    author: requiredString("ผู้จัดทำ"),
});

export type FormProjectData = z.infer<typeof formProjectSchema>;
