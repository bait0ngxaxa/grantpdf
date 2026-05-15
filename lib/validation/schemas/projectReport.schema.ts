import { z } from "zod";
import { REPORT_STATUS, REPORT_TYPES } from "@/lib/constants";
import { PROJECT_REPORT_NOTE_MAX_LENGTH } from "../constants";

export const projectReportSchema = z.object({
    reportType: z.enum([
        REPORT_TYPES.PROGRESS,
        REPORT_TYPES.FINAL,
    ]),
    note: z
        .string()
        .trim()
        .max(
            PROJECT_REPORT_NOTE_MAX_LENGTH,
            `หมายเหตุต้องไม่เกิน ${PROJECT_REPORT_NOTE_MAX_LENGTH} ตัวอักษร`,
        )
        .optional(),
});

export const updateProjectReportStatusSchema = z.object({
    reportId: z.coerce.number().int().positive("รหัสรายงานไม่ถูกต้อง"),
    status: z.enum([
        REPORT_STATUS.PENDING_REVIEW,
        REPORT_STATUS.NEEDS_REVISION,
        REPORT_STATUS.APPROVED,
    ]),
    adminNote: z
        .string()
        .trim()
        .max(
            PROJECT_REPORT_NOTE_MAX_LENGTH,
            `หมายเหตุผู้ตรวจต้องไม่เกิน ${PROJECT_REPORT_NOTE_MAX_LENGTH} ตัวอักษร`,
        )
        .optional(),
});

export type ProjectReportInput = z.infer<typeof projectReportSchema>;
export type UpdateProjectReportStatusInput = z.infer<
    typeof updateProjectReportStatusSchema
>;
