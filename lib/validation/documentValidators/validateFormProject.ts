import type { FormProjectData } from "@/config/initialData";
import type { DocumentValidationResult } from "../types";
import { validateRequired } from "../helpers";
import { FORMPROJECT_LABELS } from "../fieldLabels";

export function validateFormProject(
    data: FormProjectData,
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
