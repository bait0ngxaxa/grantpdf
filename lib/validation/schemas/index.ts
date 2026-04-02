// Document schemas + types
export { approvalSchema, type ApprovalData } from "./approval.schema";
export { contractSchema, type ContractData } from "./contract.schema";
export { formProjectSchema, type FormProjectData } from "./formProject.schema";
export { summarySchema, type SummaryData } from "./summary.schema";
export { torSchema, type TORData } from "./tor.schema";

// Auth schemas + types
export {
    signupSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    type SignupInput,
    type ForgotPasswordInput,
    type ResetPasswordInput,
} from "./auth.schema";

// Shared helpers
export {
    requiredString,
    phoneSchema,
    normalizePhoneNumber,
    emailSchema,
    citizenIdSchema,
    optionalPhoneSchema,
    optionalEmailSchema,
} from "./shared";
