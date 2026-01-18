import type { FormProjectData } from "@/config/initialData";

export const FORMPROJECT_LABELS: Record<keyof FormProjectData, string> = {
    fileName: "ชื่อไฟล์",
    projectName: "ชื่อโครงการ",
    person: "ผู้รับผิดชอบ",
    address: "ที่อยู่",
    tel: "เบอร์โทร",
    email: "อีเมล",
    timeline: "ระยะเวลา",
    cost: "งบประมาณ",
    rationale: "หลักการและเหตุผล",
    objective: "วัตถุประสงค์",
    goal: "เป้าหมาย",
    target: "กลุ่มเป้าหมาย",
    product: "ผลผลิต",
    scope: "ขอบเขตงาน",
    result: "ผลลัพธ์",
    author: "ผู้จัดทำ",
};
