import type { TORData } from "@/config/initialData";
import type { DocumentValidationResult } from "../types";
import { validateRequired } from "../helpers";
import { TOR_LABELS } from "../fieldLabels";

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
