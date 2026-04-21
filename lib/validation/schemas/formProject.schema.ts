import { z } from "zod";
import {
    requiredString,
    phoneSchema,
    emailSchema,
    requiredBoundedString,
    DOCUMENT_FILE_NAME_MAX_LENGTH,
    PROJECT_NAME_MAX_LENGTH,
} from "./shared";

export const formProjectSchema = z.object({
    fileName: requiredBoundedString("ชื่อไฟล์", DOCUMENT_FILE_NAME_MAX_LENGTH),
    projectName: requiredBoundedString("ชื่อโครงการ", PROJECT_NAME_MAX_LENGTH),
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
