// =====================================================
// TOR Document
// =====================================================
export interface TORData {
    projectName: string;
    fileName: string;
    owner: string;
    address: string;
    email: string;
    tel: string;
    timeline: string;
    contractnumber: string;
    cost: string;
    topic1: string;
    objective1: string;
    objective2: string;
    objective3: string;
    target: string;
    zone: string;
    plan: string;
    projectmanage: string;
    partner: string;
    date: string;
}

export interface ActivityData {
    activity: string;
    manager: string;
    evaluation2: string;
    duration: string;
}

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
    objective2: "",
    objective3: "",
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

// =====================================================
// Summary Document (Excel)
// =====================================================
export interface SummaryData {
    fileName: string;
    projectName: string;
    contractNumber: string;
    organize: string;
    projectOwner: string;
    projectReview: string;
    inspector: string;
    coordinator: string;
    projectCode: string;
    projectActivity: string;
    projectNhf: string;
    projectCo: string;
    month: string;
    timeline: string;
    sec1: string;
    sec2: string;
    sec3: string;
    sum: string;
    funds: string;
}

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

// =====================================================
// Form Project Document
// =====================================================
export interface FormProjectData {
    fileName: string;
    projectName: string;
    person: string;
    address: string;
    tel: string;
    email: string;
    timeline: string;
    cost: string;
    rationale: string;
    objective: string;
    goal: string;
    target: string;
    product: string;
    scope: string;
    result: string;
    author: string;
}

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

// =====================================================
// Contract Document
// =====================================================
export interface ContractData {
    fileName: string;
    projectName: string;
    contractnumber: string;
    projectOffer: string;
    projectCo: string;
    owner: string;
    acceptNum: string;
    projectCode: string;
    cost: string;
    timelineMonth: string;
    timelineText: string;
    section: string;
    date: string;
    name: string;
    address: string;
    citizenid: string;
    citizenexpire: string;
    witness: string;
}

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

// =====================================================
// Approval Document
// =====================================================
export interface ApprovalData {
    head: string;
    fileName: string;
    projectName: string;
    date: string;
    topicdetail: string;
    todetail: string;
    attachments: string[];
    detail: string;
    name: string;
    depart: string;
    coor: string;
    tel: string;
    email: string;
    accept: string;
}

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
