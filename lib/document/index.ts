// Types
export type {
    SessionValidationResult,
    DocumentSaveResult,
    ProjectResult,
    DocxModule,
    DocxParserOptions,
} from "./types";

export { isSessionError, isProjectError } from "./types";

// Session
export { validateSession } from "./sessionValidator";

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
