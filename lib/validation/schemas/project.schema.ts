import { z } from "zod";
import { PROJECT_STATUS } from "@/type/models";
import {
    PROJECT_DESCRIPTION_MAX_LENGTH,
    PROJECT_NAME_MAX_LENGTH,
    PROJECT_STATUS_NOTE_MAX_LENGTH,
} from "../constants";

const projectStatusValues = [
    PROJECT_STATUS.IN_PROGRESS,
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.REJECTED,
    PROJECT_STATUS.EDIT,
    PROJECT_STATUS.CLOSED,
] as const;
export const createProjectSchema = z.object({
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
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
