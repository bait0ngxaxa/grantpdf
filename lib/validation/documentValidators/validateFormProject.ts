import type { FormProjectData } from "@/lib/validation/schemas";
import type { DocumentValidationResult } from "../types";
import { zodValidate } from "../helpers";
import { formProjectSchema } from "@/lib/validation/schemas";

export function validateFormProject(
    data: FormProjectData,
): DocumentValidationResult<FormProjectData> {
    return zodValidate(formProjectSchema, data);
}
