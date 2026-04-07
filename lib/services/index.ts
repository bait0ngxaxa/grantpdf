// Project Service
export {
    getAllProjectsPaginated,
    getProjectsByUserId,
    getUserProjectStats,
    getProjectsByUserIdPaginated,
    updateProjectStatus,
    createProject,
    createProjectWithAudit,
    updateProjectWithAudit,
    deleteProjectWithAudit,
    getUserFilesPaginated,
    getAllFilesPaginated,
} from "./projectService";

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
