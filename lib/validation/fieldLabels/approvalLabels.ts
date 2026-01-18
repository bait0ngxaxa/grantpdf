import type { ApprovalData } from "@/config/initialData";

export const APPROVAL_LABELS: Record<keyof ApprovalData, string> = {
    head: "เลขที่หนังสือ",
    fileName: "ชื่อไฟล์",
    projectName: "ชื่อโครงการ",
    date: "วันที่",
    topicdetail: "รายละเอียดเรื่อง",
    todetail: "รายละเอียดถึง",
    attachments: "เอกสารแนบ",
    detail: "รายละเอียด",
    name: "ชื่อผู้ลงนาม",
    depart: "หน่วยงาน",
    coor: "ผู้ประสานงาน",
    tel: "เบอร์โทร",
    email: "อีเมล",
    accept: "ผู้อนุมัติ",
};
