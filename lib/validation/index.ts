// Types
export type {
    ValidationResult,
    ValidationErrors,
    DocumentValidationResult,
} from "./types";

// Zod Schemas and Types (ใช้แทน custom validators/types เดิม)
export type { ApprovalData, ContractData, FormProjectData, SummaryData, TORData } from "./schemas";
export type { SignupInput, ForgotPasswordInput, ResetPasswordInput } from "./schemas";
export {
    approvalSchema,
    contractSchema,
    formProjectSchema,
    summarySchema,
    torSchema,
    signupSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    requiredString,
    phoneSchema,
    normalizePhoneNumber,
    emailSchema,
    citizenIdSchema,
    optionalPhoneSchema,
    optionalEmailSchema,
} from "./schemas";

// Adapter
export { zodValidate, validateRequired } from "./helpers";

// Input Formatters (ยังคงไว้สำหรับ input formatting ใน UI)
export {
    formatPhoneInput,
    formatCitizenIdInput,
    validateAndFormatPhone,
    validateAndFormatCitizenId,
} from "./inputFormatters";

// Document Validators
export {
    validateSummary,
    validateTOR,
    validateFormProject,
    validateContract,
    validateApproval,
} from "./documentValidators";
