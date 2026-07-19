// =====================================================
// Re-export types from Zod schemas (SSOT)
// =====================================================
export type { ActivityData, ApprovalData } from "@/lib/validation/schemas";
export type { ContractData } from "@/lib/validation/schemas";
export type { FormProjectData } from "@/lib/validation/schemas";
export type { SummaryData } from "@/lib/validation/schemas";
export type { TORData } from "@/lib/validation/schemas";

// =====================================================
// Initial Data Constants
// =====================================================
import type {
    ActivityData,
    TORData,
} from "@/lib/validation/schemas";
export const initialTORData: TORData = {
    projectName: "",
    fileName: "",
    date: "",
    owner: "",
    address: "",
    email: "",
    tel: "",
    timeline: "",
    contractnumber: "",
    cost: "",
    topic1: "",
    objective1: "",
    target: "",
    zone: "",
    plan: "",
    projectmanage: "",
    partner: "",
};

export const initialActivity: ActivityData = {
    activity: "",
    manager: "",
    evaluation2: "",
    duration: "",
};

import type { SummaryData } from "@/lib/validation/schemas";
export const initialSummaryData: SummaryData = {
    fileName: "",
    projectName: "",
    contractNumber: "",
    organize: "",
    projectOwner: "",
    projectReview: "",
    inspector: "",
    coordinator: "",
    projectCode: "",
    projectActivity: "",
    projectNhf: "",
    projectCo: "",
    month: "",
    timeline: "",
    sec1: "",
    sec2: "",
    sec3: "",
    sum: "",
    funds: "",
};

import type { FormProjectData } from "@/lib/validation/schemas";
export const initialFormProjectData: FormProjectData = {
    projectName: "",
    fileName: "",
    person: "",
    address: "",
    tel: "",
    email: "",
    timeline: "",
    cost: "",
    rationale: "",
    objective: "",
    goal: "",
    target: "",
    product: "",
    scope: "",
    result: "",
    author: "",
};

import type { ContractData } from "@/lib/validation/schemas";
export const initialContractData: ContractData = {
    fileName: "",
    projectName: "",
    contractnumber: "",
    projectOffer: "",
    projectCo: "",
    owner: "",
    acceptNum: "",
    projectCode: "",
    cost: "",
    timelineMonth: "",
    timelineText: "",
    section: "",
    name: "",
    address: "",
    citizenid: "",
    citizenexpire: "",
    date: "",
    witness: "",
};

import type { ApprovalData } from "@/lib/validation/schemas";
export const initialApprovalData: ApprovalData = {
    head: "",
    fileName: "",
    projectName: "",
    date: "",
    topicdetail: "",
    todetail: "",
    attachments: [],
    detail: "",
    name: "",
    depart: "",
    coor: "",
    tel: "",
    email: "",
    accept: "",
};

export const approvalFixedValues = {
    topic: "รายงานผลการปฏิบัติงาน",
    to: "ผู้จัดการฝ่ายบริหาร",
    attachment: "เอกสารแนบตามที่ระบุ",
    regard: "ขอแสดงความนับถืออย่างสูง",
};
