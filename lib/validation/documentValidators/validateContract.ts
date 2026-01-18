import type { ContractData } from "@/config/initialData";
import type { DocumentValidationResult } from "../types";
import { validateRequired } from "../helpers";
import { CONTRACT_LABELS } from "../fieldLabels";

export function validateContract(
    data: ContractData,
): DocumentValidationResult<ContractData> {
    const requiredFields: (keyof ContractData)[] = [
        "fileName",
        "projectName",
        "projectOffer",
        "projectCo",
        "owner",
        "acceptNum",
        "projectCode",
        "cost",
        "timelineMonth",
        "timelineText",
        "section",
        "date",
        "name",
        "address",
        "citizenid",
        "citizenexpire",
        "witness",
    ];

    return validateRequired(data, requiredFields, CONTRACT_LABELS);
}
