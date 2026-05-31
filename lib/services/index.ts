// Project Service
export {
    getAllProjectsPaginated,
    getProjectSummariesByUserId,
    getUserProjectStats,
    getProjectsByUserIdPaginated,
    updateProjectStatus,
    updateProjectStatusWithAudit,
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
    getCoOwnerUserOptions,
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
    updateProjectReportStatusWithAudit,
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

// Auth Session Service
export {
    createAccessToken,
    verifyAccessToken,
    createRefreshSession,
    rotateRefreshSession,
    revokeSession,
    revokeRefreshSession,
    revokeAllUserSessions,
    generateRefreshToken,
    hashRefreshToken,
} from "./authSessionService";
export type {
    AccessTokenPayload,
    CreateRefreshSessionInput,
    CreateRefreshSessionResult,
    RotateRefreshSessionResult,
} from "./authSessionService";

// Device Session Service
export {
    getUserDeviceSessions,
    revokeUserSessionFamily,
    revokeOtherUserSessionFamilies,
} from "./deviceSessionService";
export type {
    DeviceSessionStatus,
    DeviceSessionSummary,
} from "./deviceSessionService";
