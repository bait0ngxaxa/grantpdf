import type { SummaryData } from "@/config/initialData";

export const SUMMARY_LABELS: Record<keyof SummaryData, string> = {
    fileName: "ชื่อไฟล์",
    projectName: "ชื่อโครงการ",
    contractNumber: "เลขที่สัญญา",
    organize: "หน่วยงานที่เสนอโครงการ",
    projectOwner: "ผู้เสนอโครงการ",
    projectReview: "ผู้ทบทวนโครงการ",
    inspector: "ผู้ตรวจสอบ",
    coordinator: "ผู้ประสานงาน",
    projectCode: "รหัสชุดโครงการ",
    projectActivity: "รหัสภายใต้กิจกรรม",
    projectNhf: "เลขที่ มสช น.",
    projectCo: "ชุดโครงการ",
    month: "ระยะเวลาดำเนินการ",
    timeline: "ระยะเวลา",
    sec1: "งวด 1",
    sec2: "งวด 2",
    sec3: "งวด 3",
    sum: "รวม",
    funds: "แหล่งทุน",
};
