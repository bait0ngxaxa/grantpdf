import type { SummaryData } from "@/lib/validation/schemas";
import type { DocumentValidationResult } from "../types";
import { zodValidate } from "../helpers";
import { summarySchema } from "@/lib/validation/schemas";

export function validateSummary(
    data: SummaryData,
): DocumentValidationResult<SummaryData> {
    return zodValidate(summarySchema, data);
}
