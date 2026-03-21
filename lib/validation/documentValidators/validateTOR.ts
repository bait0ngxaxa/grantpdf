import type { TORData } from "@/lib/validation/schemas";
import type { DocumentValidationResult } from "../types";
import { zodValidate } from "../helpers";
import { torSchema } from "@/lib/validation/schemas";

export function validateTOR(
    data: TORData,
): DocumentValidationResult<TORData> {
    return zodValidate(torSchema, data);
}
