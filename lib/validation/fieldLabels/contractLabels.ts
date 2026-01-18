import type { ContractData } from "@/config/initialData";

export const CONTRACT_LABELS: Record<keyof ContractData, string> = {
    fileName: "ชื่อไฟล์",
    projectName: "ชื่อโครงการ",
    contractnumber: "เลขที่สัญญา",
    projectOffer: "ข้อเสนอโครงการ",
    projectCo: "ชุดโครงการ",
    owner: "ผู้รับจ้าง",
    acceptNum: "เลขที่ใบสั่งจ้าง",
    projectCode: "รหัสโครงการ",
    cost: "มูลค่าสัญญา",
    timelineMonth: "ระยะเวลา (เดือน)",
    timelineText: "ระยะเวลา (ข้อความ)",
    section: "งวดงาน",
    date: "วันที่ทำสัญญา",
    name: "ชื่อผู้รับจ้าง",
    address: "ที่อยู่ผู้รับจ้าง",
    citizenid: "เลขบัตรประชาชน",
    citizenexpire: "วันหมดอายุบัตร",
    witness: "พยาน",
};
