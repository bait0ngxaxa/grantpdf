import type {
    SummaryData,
    TORData,
    FormProjectData,
    ContractData,
    ApprovalData,
} from "@/config/initialData";

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface DocumentValidationResult<T> {
    isValid: boolean;
    errors: ValidationErrors<T>;
}

/**
 * Validate Thai phone number (must be exactly 10 digits)
 */
export function validatePhone(value: string): ValidationResult {
    const digitsOnly = value.replace(/\D/g, "");

    if (!value || value.trim() === "") {
        return { isValid: true };
    }

    if (!/^\d+$/.test(value)) {
        return {
            isValid: false,
            error: "เบอร์โทรต้องเป็นตัวเลขเท่านั้น",
        };
    }

    if (digitsOnly.length !== 10) {
        return {
            isValid: false,
            error: "เบอร์โทรต้องมี 10 หลัก",
        };
    }

    return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(value: string): ValidationResult {
    if (!value || value.trim() === "") {
        return { isValid: true };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return {
            isValid: false,
            error: "รูปแบบอีเมลไม่ถูกต้อง (เช่น example@mail.com)",
        };
    }

    return { isValid: true };
}

/**
 * Validate Thai citizen ID (must be exactly 13 digits)
 */
export function validateCitizenId(value: string): ValidationResult {
    const digitsOnly = value.replace(/\D/g, "");

    if (!value || value.trim() === "") {
        return { isValid: true };
    }

    if (!/^\d+$/.test(value)) {
        return {
            isValid: false,
            error: "เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น",
        };
    }

    if (digitsOnly.length !== 13) {
        return {
            isValid: false,
            error: "เลขบัตรประชาชนต้องมี 13 หลัก",
        };
    }

    return { isValid: true };
}

// =====================================================
// Input Formatters
// =====================================================

export function formatPhoneInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 10);
}

export function formatCitizenIdInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 13);
}

export function validateAndFormatPhone(value: string): {
    value: string;
    error?: string;
} {
    const formatted = formatPhoneInput(value);
    const validation = validatePhone(formatted);
    return {
        value: formatted,
        error: validation.error,
    };
}

export function validateAndFormatCitizenId(value: string): {
    value: string;
    error?: string;
} {
    const formatted = formatCitizenIdInput(value);
    const validation = validateCitizenId(formatted);
    return {
        value: formatted,
        error: validation.error,
    };
}

// =====================================================
// Field Label Mappings for Thai Error Messages
// =====================================================

const SUMMARY_LABELS: Record<keyof SummaryData, string> = {
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

const TOR_LABELS: Record<keyof TORData, string> = {
    projectName: "ชื่อโครงการ",
    fileName: "ชื่อไฟล์",
    owner: "ผู้รับผิดชอบ",
    address: "ที่อยู่",
    email: "อีเมล",
    tel: "เบอร์โทร",
    timeline: "ระยะเวลา",
    contractnumber: "เลขที่สัญญา",
    cost: "งบประมาณ",
    topic1: "หัวข้อ",
    objective1: "วัตถุประสงค์ 1",
    target: "กลุ่มเป้าหมาย",
    zone: "พื้นที่ดำเนินการ",
    plan: "แผนการดำเนินงาน",
    projectmanage: "การบริหารจัดการ",
    partner: "ภาคีร่วม",
    date: "วันที่",
};

const FORMPROJECT_LABELS: Record<keyof FormProjectData, string> = {
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

const CONTRACT_LABELS: Record<keyof ContractData, string> = {
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

const APPROVAL_LABELS: Record<keyof ApprovalData, string> = {
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

// =====================================================
// Generic Validation Helper
// =====================================================

function validateRequired<T extends object>(
    data: T,
    requiredFields: (keyof T)[],
    labels: Record<keyof T, string>
): DocumentValidationResult<T> {
    const errors: ValidationErrors<T> = {};

    for (const field of requiredFields) {
        const value = data[field];
        if (value === null || value === undefined) {
            errors[field] = `กรุณาระบุ${labels[field]}`;
        } else if (typeof value === "string" && value.trim() === "") {
            errors[field] = `กรุณาระบุ${labels[field]}`;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

// =====================================================
// Document-specific Validators
// =====================================================

export function validateSummary(
    data: SummaryData
): DocumentValidationResult<SummaryData> {
    const requiredFields: (keyof SummaryData)[] = [
        "fileName",
        "projectName",
        "contractNumber",
        "organize",
        "projectOwner",
        "projectReview",
        "coordinator",
        "projectCode",
        "projectActivity",
        "projectNhf",
        "projectCo",
        "month",
        "timeline",
        "sec1",
        "sec2",
        "sec3",
        "sum",
        "funds",
    ];

    return validateRequired(data, requiredFields, SUMMARY_LABELS);
}

export function validateTOR(data: TORData): DocumentValidationResult<TORData> {
    const requiredFields: (keyof TORData)[] = [
        "projectName",
        "fileName",
        "date",
        "owner",
        "address",
        "email",
        "tel",
        "timeline",
        "contractnumber",
        "cost",
        "topic1",
        "objective1",
        "target",
        "zone",
        "plan",
        "projectmanage",
        "partner",
    ];

    return validateRequired(data, requiredFields, TOR_LABELS);
}

export function validateFormProject(
    data: FormProjectData
): DocumentValidationResult<FormProjectData> {
    const requiredFields: (keyof FormProjectData)[] = [
        "fileName",
        "projectName",
        "person",
        "address",
        "tel",
        "email",
        "timeline",
        "cost",
        "rationale",
        "objective",
        "goal",
        "target",
        "product",
        "scope",
        "result",
        "author",
    ];

    return validateRequired(data, requiredFields, FORMPROJECT_LABELS);
}

export function validateContract(
    data: ContractData
): DocumentValidationResult<ContractData> {
    const requiredFields: (keyof ContractData)[] = [
        "fileName",
        "projectName",
        "projectOffer",
        "projectCo",
        "owner",
        "acceptNum",
        "projectCode",
        "cost",
        "timelineMonth",
        "timelineText",
        "section",
        "date",
        "name",
        "address",
        "citizenid",
        "citizenexpire",
        "witness",
    ];

    return validateRequired(data, requiredFields, CONTRACT_LABELS);
}

export function validateApproval(
    data: ApprovalData
): DocumentValidationResult<ApprovalData> {
    const requiredFields: (keyof ApprovalData)[] = [
        "head",
        "projectName",
        "date",
        "topicdetail",
        "todetail",
        "name",
        "depart",
        "coor",
        "tel",
        "email",
        "accept",
        "detail",
    ];

    return validateRequired(data, requiredFields, APPROVAL_LABELS);
}
