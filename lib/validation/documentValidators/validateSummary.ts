import type { SummaryData } from "@/config/initialData";
import type { DocumentValidationResult } from "../types";
import { validateRequired } from "../helpers";
import { SUMMARY_LABELS } from "../fieldLabels";

export function validateSummary(
    data: SummaryData,
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
