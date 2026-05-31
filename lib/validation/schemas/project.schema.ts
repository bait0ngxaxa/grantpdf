import { z } from "zod";
import { PROJECT_STATUS } from "@/type/models";
import {
    PROJECT_DESCRIPTION_MAX_LENGTH,
    PROJECT_NAME_MAX_LENGTH,
    PROJECT_STATUS_NOTE_MAX_LENGTH,
    PROGRAM_NAME_MAX_LENGTH,
    PROGRAM_DESCRIPTION_MAX_LENGTH,
} from "../constants";

const projectStatusValues = [
    PROJECT_STATUS.IN_PROGRESS,
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.REJECTED,
    PROJECT_STATUS.EDIT,
    PROJECT_STATUS.CLOSED,
] as const;
export const createProjectSchema = z.object({
    programId: z.coerce
        .number({ message: "กรุณาเลือกโครงการหลัก" })
        .int({ message: "รหัสโครงการหลักไม่ถูกต้อง" })
        .positive({ message: "กรุณาเลือกโครงการหลัก" }),
    name: z
        .string("กรุณาระบุชื่อโครงการ")
        .trim()
        .min(1, { message: "กรุณาระบุชื่อโครงการ" })
        .max(PROJECT_NAME_MAX_LENGTH, { message: "ชื่อโครงการยาวเกินไป" }),
    description: z
        .string()
        .trim()
        .max(PROJECT_DESCRIPTION_MAX_LENGTH, {
            message: "รายละเอียดโครงการยาวเกินไป",
        })
        .optional()
        .or(z.literal("")),
});

export const updateProjectStatusSchema = z.object({
    projectId: z.coerce
        .number({ message: "รหัสโครงการไม่ถูกต้อง" })
        .int({ message: "รหัสโครงการไม่ถูกต้อง" })
        .positive({ message: "รหัสโครงการไม่ถูกต้อง" }),
    status: z.enum(projectStatusValues, {
        message: "สถานะโครงการไม่ถูกต้อง",
    }),
    statusNote: z
        .string()
        .trim()
        .max(PROJECT_STATUS_NOTE_MAX_LENGTH, {
            message: "หมายเหตุสถานะยาวเกินไป",
        })
        .optional()
        .or(z.literal("")),
});

export const updateAdminProjectSchema = updateProjectStatusSchema.extend({
    programId: z
        .union([
            z.coerce
                .number({ message: "รหัสโครงการหลักไม่ถูกต้อง" })
                .int({ message: "รหัสโครงการหลักไม่ถูกต้อง" })
                .positive({ message: "รหัสโครงการหลักไม่ถูกต้อง" }),
            z.null(),
        ])
        .optional(),
});

export const updateProjectCoOwnersSchema = z
    .object({
        projectId: z.coerce
            .number({ message: "รหัสโครงการไม่ถูกต้อง" })
            .int({ message: "รหัสโครงการไม่ถูกต้อง" })
            .positive({ message: "รหัสโครงการไม่ถูกต้อง" }),
        allowCoOwners: z.boolean({ message: "สถานะเจ้าของร่วมไม่ถูกต้อง" }),
        adminUserIds: z
            .array(
                z.coerce
                    .number({ message: "รหัสผู้ใช้ไม่ถูกต้อง" })
                    .int({ message: "รหัสผู้ใช้ไม่ถูกต้อง" })
                    .positive({ message: "รหัสผู้ใช้ไม่ถูกต้อง" }),
            )
            .max(20, { message: "เลือกเจ้าของร่วมได้สูงสุด 20 คน" }),
    })
    .superRefine((data, context) => {
        if (data.allowCoOwners && data.adminUserIds.length === 0) {
            context.addIssue({
                code: "custom",
                path: ["adminUserIds"],
                message: "กรุณาเลือกเจ้าของร่วมอย่างน้อย 1 คน",
            });
        }
    });

export const updateAdminUserSchema = z.object({
    name: z
        .string("กรุณากรอกชื่อ")
        .trim()
        .min(1, { message: "กรุณากรอกชื่อ" })
        .max(255, { message: "ชื่อยาวเกินไป" }),
    role: z.enum(["member", "admin"], {
        message: "บทบาทไม่ถูกต้อง",
    }),
});

export const updateProjectSchema = z.object({
    name: z
        .string("กรุณาระบุชื่อโครงการ")
        .trim()
        .min(1, { message: "กรุณาระบุชื่อโครงการ" })
        .max(PROJECT_NAME_MAX_LENGTH, { message: "ชื่อโครงการยาวเกินไป" }),
    description: z
        .string()
        .trim()
        .max(PROJECT_DESCRIPTION_MAX_LENGTH, {
            message: "รายละเอียดโครงการยาวเกินไป",
        })
        .optional()
        .or(z.literal("")),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;
export type UpdateAdminProjectInput = z.infer<typeof updateAdminProjectSchema>;
export type UpdateProjectCoOwnersInput = z.infer<typeof updateProjectCoOwnersSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Program schemas (admin CRUD)
export const createProgramSchema = z.object({
    name: z
        .string("กรุณาระบุชื่อโครงการหลัก")
        .trim()
        .min(1, { message: "กรุณาระบุชื่อโครงการหลัก" })
        .max(PROGRAM_NAME_MAX_LENGTH, { message: "ชื่อโครงการหลักยาวเกินไป" }),
    description: z
        .string()
        .trim()
        .max(PROGRAM_DESCRIPTION_MAX_LENGTH, {
            message: "รายละเอียดยาวเกินไป",
        })
        .optional()
        .or(z.literal("")),
});

export const updateProgramSchema = z.object({
    name: z
        .string("กรุณาระบุชื่อโครงการหลัก")
        .trim()
        .min(1, { message: "กรุณาระบุชื่อโครงการหลัก" })
        .max(PROGRAM_NAME_MAX_LENGTH, { message: "ชื่อโครงการหลักยาวเกินไป" }),
    description: z
        .string()
        .trim()
        .max(PROGRAM_DESCRIPTION_MAX_LENGTH, {
            message: "รายละเอียดยาวเกินไป",
        })
        .optional()
        .or(z.literal("")),
    isActive: z.boolean({ message: "สถานะไม่ถูกต้อง" }),
    sortOrder: z.coerce
        .number({ message: "ลำดับไม่ถูกต้อง" })
        .int({ message: "ลำดับต้องเป็นจำนวนเต็ม" })
        .min(0, { message: "ลำดับต้องไม่ติดลบ" }),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
