import type { ApprovalData } from "@/lib/validation/schemas";
import type { DocumentValidationResult } from "../types";
import { zodValidate } from "../helpers";
import { approvalSchema } from "@/lib/validation/schemas";

export function validateApproval(
    data: ApprovalData,
): DocumentValidationResult<ApprovalData> {
    return zodValidate(approvalSchema, data);
}
