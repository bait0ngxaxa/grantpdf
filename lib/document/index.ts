// Types
export type {
    DocumentSaveResult,
    ProjectResult,
    DocxModule,
    DocxParserOptions,
} from "./types";

export { isProjectError } from "./types";

// Session (re-exported from sessionService for backward compatibility)
export {
    validateSession,
    isSessionError,
    type SessionValidationResult,
} from "@/lib/services/sessionService";

// Template Renderer (Docxtemplater)
export { createDocxRenderer, loadTemplate } from "./templateRenderer";

// Storage
export { saveDocumentToStorage } from "./storage";

// Project Service
export { findOrCreateProject, createUserFileRecord } from "./projectService";

// Response
export { handleDocumentError, buildSuccessResponse } from "./responseBuilder";

// Utils
export {
    fixThaiDistributed,
    generateUniqueFilename,
    getMimeType,
} from "./fixThaiwordUtils";
