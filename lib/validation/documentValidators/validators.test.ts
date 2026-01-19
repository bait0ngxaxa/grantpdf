import { describe, it, expect } from "vitest";
import { validateApproval } from "./validateApproval";
import { validateContract } from "./validateContract";
import { validateFormProject } from "./validateFormProject";
import { validateSummary } from "./validateSummary";
import { validateTOR } from "./validateTOR";
import type {
    ApprovalData,
    ContractData,
    FormProjectData,
    SummaryData,
    TORData,
} from "@/config/initialData";

// ============================================
// validateApproval
// ============================================
describe("validateApproval", () => {
    const createValidApprovalData = (): ApprovalData => ({
        head: "หัวข้อ",
        fileName: "approval.docx",
        projectName: "โครงการทดสอบ",
        date: "2025-01-15",
        topicdetail: "รายละเอียดหัวเรื่อง",
        todetail: "ผู้รับ",
        attachments: ["เอกสารแนบ 1"],
        detail: "รายละเอียด",
        name: "ผู้จัดทำ",
        depart: "ฝ่ายบริหาร",
        coor: "ผู้ประสานงาน",
        tel: "0812345678",
        email: "test@example.com",
        accept: "อนุมัติ",
    });

    it("should return valid when all required fields are filled", () => {
        const data = createValidApprovalData();
        const result = validateApproval(data);

        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("should return errors for missing required fields", () => {
        const data = createValidApprovalData();
        data.head = "";
        data.projectName = "";

        const result = validateApproval(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.head).toBeDefined();
        expect(result.errors.projectName).toBeDefined();
    });

    it("should return errors for all empty fields", () => {
        const data: ApprovalData = {
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

        const result = validateApproval(data);

        expect(result.isValid).toBe(false);
        // Should have errors for required fields (excluding attachments which is array)
        expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
});

// ============================================
// validateContract
// ============================================
describe("validateContract", () => {
    const createValidContractData = (): ContractData => ({
        fileName: "contract.docx",
        projectName: "โครงการทดสอบ",
        contractnumber: "C-001",
        projectOffer: "งบประมาณ 100,000 บาท",
        projectCo: "ผู้ร่วมโครงการ",
        owner: "เจ้าของโครงการ",
        acceptNum: "A-001",
        projectCode: "P-001",
        cost: "100,000",
        timelineMonth: "12",
        timelineText: "มกราคม - ธันวาคม 2568",
        section: "หมวด 1",
        date: "2025-01-15",
        name: "ผู้จัดทำ",
        address: "ที่อยู่",
        citizenid: "1234567890123",
        citizenexpire: "2030-01-01",
        witness: "พยาน",
    });

    it("should return valid when all required fields are filled", () => {
        const data = createValidContractData();
        const result = validateContract(data);

        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("should return errors for missing required fields", () => {
        const data = createValidContractData();
        data.fileName = "";
        data.projectName = "";
        data.citizenid = "";

        const result = validateContract(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.fileName).toBeDefined();
        expect(result.errors.projectName).toBeDefined();
        expect(result.errors.citizenid).toBeDefined();
    });
});

// ============================================
// validateFormProject
// ============================================
describe("validateFormProject", () => {
    const createValidFormProjectData = (): FormProjectData => ({
        fileName: "project.docx",
        projectName: "โครงการทดสอบ",
        person: "ผู้รับผิดชอบ",
        address: "ที่อยู่",
        tel: "0812345678",
        email: "test@example.com",
        timeline: "มกราคม - ธันวาคม 2568",
        cost: "100,000",
        rationale: "หลักการและเหตุผล",
        objective: "วัตถุประสงค์",
        goal: "เป้าหมาย",
        target: "กลุ่มเป้าหมาย",
        product: "ผลผลิต",
        scope: "ขอบเขต",
        result: "ผลลัพธ์",
        author: "ผู้จัดทำ",
    });

    it("should return valid when all required fields are filled", () => {
        const data = createValidFormProjectData();
        const result = validateFormProject(data);

        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("should return errors for missing required fields", () => {
        const data = createValidFormProjectData();
        data.rationale = "";
        data.objective = "";

        const result = validateFormProject(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.rationale).toBeDefined();
        expect(result.errors.objective).toBeDefined();
    });
});

// ============================================
// validateSummary
// ============================================
describe("validateSummary", () => {
    const createValidSummaryData = (): SummaryData => ({
        fileName: "summary.xlsx",
        projectName: "โครงการทดสอบ",
        contractNumber: "C-001",
        organize: "องค์กร",
        projectOwner: "เจ้าของโครงการ",
        projectReview: "ผู้ตรวจสอบ",
        inspector: "ผู้ตรวจ",
        coordinator: "ผู้ประสานงาน",
        projectCode: "P-001",
        projectActivity: "กิจกรรมโครงการ",
        projectNhf: "NHF",
        projectCo: "ผู้ร่วมโครงการ",
        month: "12",
        timeline: "มกราคม - ธันวาคม 2568",
        sec1: "ส่วนที่ 1",
        sec2: "ส่วนที่ 2",
        sec3: "ส่วนที่ 3",
        sum: "รวม",
        funds: "100,000",
    });

    it("should return valid when all required fields are filled", () => {
        const data = createValidSummaryData();
        const result = validateSummary(data);

        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("should return errors for missing required fields", () => {
        const data = createValidSummaryData();
        data.projectName = "";
        data.contractNumber = "";

        const result = validateSummary(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.projectName).toBeDefined();
        expect(result.errors.contractNumber).toBeDefined();
    });
});

// ============================================
// validateTOR
// ============================================
describe("validateTOR", () => {
    const createValidTORData = (): TORData => ({
        projectName: "โครงการทดสอบ",
        fileName: "tor.docx",
        date: "2025-01-15",
        owner: "เจ้าของโครงการ",
        address: "ที่อยู่",
        email: "test@example.com",
        tel: "0812345678",
        timeline: "มกราคม - ธันวาคม 2568",
        contractnumber: "C-001",
        cost: "100,000",
        topic1: "หัวข้อ 1",
        objective1: "วัตถุประสงค์ 1",
        target: "กลุ่มเป้าหมาย",
        zone: "พื้นที่ดำเนินการ",
        plan: "แผนงาน",
        projectmanage: "การบริหารโครงการ",
        partner: "พันธมิตร",
    });

    it("should return valid when all required fields are filled", () => {
        const data = createValidTORData();
        const result = validateTOR(data);

        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("should return errors for missing required fields", () => {
        const data = createValidTORData();
        data.projectName = "";
        data.owner = "";
        data.target = "";

        const result = validateTOR(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.projectName).toBeDefined();
        expect(result.errors.owner).toBeDefined();
        expect(result.errors.target).toBeDefined();
    });

    it("should validate all required fields are present", () => {
        // Test with all empty fields
        const emptyData: TORData = {
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

        const result = validateTOR(emptyData);

        expect(result.isValid).toBe(false);
        // Check that we have errors for required fields
        expect(result.errors.projectName).toBeDefined();
        expect(result.errors.fileName).toBeDefined();
        expect(result.errors.owner).toBeDefined();
    });
});
