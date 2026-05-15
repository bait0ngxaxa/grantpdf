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

// Project/API mutation schemas + types
export {
    createProjectSchema,
    updateProjectStatusSchema,
    updateAdminProjectSchema,
    updateAdminUserSchema,
    updateProjectSchema,
    createProgramSchema,
    updateProgramSchema,
    type CreateProjectInput,
    type UpdateProjectStatusInput,
    type UpdateAdminProjectInput,
    type UpdateAdminUserInput,
    type UpdateProjectInput,
    type CreateProgramInput,
    type UpdateProgramInput,
} from "./project.schema";

export {
    projectReportSchema,
    updateProjectReportStatusSchema,
    type ProjectReportInput,
    type UpdateProjectReportStatusInput,
} from "./projectReport.schema";

export {
    PROJECT_NAME_MAX_LENGTH,
    PROJECT_DESCRIPTION_MAX_LENGTH,
    PROJECT_STATUS_NOTE_MAX_LENGTH,
    PROJECT_REPORT_NOTE_MAX_LENGTH,
    PROGRAM_NAME_MAX_LENGTH,
    PROGRAM_DESCRIPTION_MAX_LENGTH,
    DOCUMENT_FILE_NAME_MAX_LENGTH,
    DOCUMENT_TEXTAREA_MAX_LENGTH,
    DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH,
    DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH,
} from "../constants";

// File/API mutation schemas + types
export {
    generateSignedUrlSchema,
    type GenerateSignedUrlInput,
} from "./file.schema";

// Shared helpers
export {
    requiredString,
    requiredBoundedString,
    phoneSchema,
    normalizePhoneNumber,
    emailSchema,
    citizenIdSchema,
    optionalPhoneSchema,
    optionalEmailSchema,
} from "./shared";
