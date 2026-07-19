// Types
export type {
    RawProject,
    RawFile,
    RawAttachment,
    PaginatedProjectsResult,
    UpdateProjectStatusParams,
} from "./types";

// Constants
export {
    PROJECT_INCLUDE,
} from "./constants";

export {
    buildProjectAccessWhere,
    buildProjectMemberAccessWhere,
    buildUserProjectsAccessWhere,
    userCanAccessProject,
} from "./projectAccess";

export {
    buildAccessibleUserFileWhere,
    canAccessProjectFile,
} from "./fileAccess";

// Sanitizers
export {
    sanitizeAttachments,
    sanitizeFiles,
    sanitizeProjects,
    sanitizeOrphanFiles,
    collectAttachmentPaths,
    filterOutAttachments,
} from "./sanitizers";

// Queries
export {
    getAllProjectsPaginated,
    getProjectSummariesByUserId,
    getUserProjectStats,
    getProjectsByUserIdPaginated,
    findProjectByNameAndUser,
    findProjectByIdAndUser,
    getUserFilesPaginated,
    getAllFilesPaginated,
} from "./queries";

// Mutations
export {
    updateProjectStatus,
    updateProjectStatusWithAudit,
    createProject,
    createProjectWithAudit,
    updateProjectWithAudit,
    deleteProjectWithAudit,
    updateProjectCoOwners,
} from "./mutations";
