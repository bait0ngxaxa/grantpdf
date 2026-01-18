import type { ApprovalData } from "@/config/initialData";
import type { DocumentValidationResult } from "../types";
import { validateRequired } from "../helpers";
import { APPROVAL_LABELS } from "../fieldLabels";

export function validateApproval(
    data: ApprovalData,
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
