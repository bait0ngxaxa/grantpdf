import type { ContractData } from "@/lib/validation/schemas";
import type { DocumentValidationResult } from "../types";
import { zodValidate } from "../helpers";
import { contractSchema } from "@/lib/validation/schemas";

export function validateContract(
    data: ContractData,
): DocumentValidationResult<ContractData> {
    return zodValidate(contractSchema, data);
}
