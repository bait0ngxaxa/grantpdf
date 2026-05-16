// Project Service
export {
    getAllProjectsPaginated,
    getProjectSummariesByUserId,
    getUserProjectStats,
    getProjectsByUserIdPaginated,
    updateProjectStatus,
    createProject,
    createProjectWithAudit,
    updateProjectWithAudit,
    deleteProjectWithAudit,
    updateProjectCoOwners,
    getUserFilesPaginated,
    getAllFilesPaginated,
} from "./projectService";

// Program Service
export {
    getActivePrograms,
    getAllPrograms,
    programExists,
    programExistsById,
    createProgram,
    updateProgram,
} from "./programService";

// User Service
export {
    getAllUsers,
    getAllUsersPaginated,
    getUserById,
    userExists,
    isValidRole,
    updateUser,
    deleteUser,
    updateUserWithAudit,
    deleteUserWithAudit,
    getUserCount,
    getAdminOwnerOptions,
    checkAdminPermission,
} from "./userService";

// File Service
export {
    getAllFilesForAdmin,
    getFilesByUserId,
    fileExists,
    getFileById,
    getFileForDeletion,
    deleteFileRecord,
} from "./fileService";

// Project Report Service
export {
    createProjectReportWithFile,
    getProjectReportsForAdmin,
    getProjectReportsForUser,
    updateProjectReportStatus,
} from "./projectReportService";

// Audit Service
export { getAuditLogsPaginated } from "./auditService";
export type { GetAuditLogsParams } from "./auditService";

// Document Idempotency Service
export {
    normalizeIdempotencyKey,
    startDocumentIdempotency,
    completeDocumentIdempotency,
    failDocumentIdempotency,
} from "./documentIdempotencyService";
export type { DocumentType as IdempotentDocumentType } from "./documentIdempotencyService";
