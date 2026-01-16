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
export { validateSession } from "./session";

// Docxtemplater
export { createDocxRenderer, loadTemplate } from "./docx";

// Storage
export { saveDocumentToStorage } from "./storage";

// Project
export { findOrCreateProject, createUserFileRecord } from "./project";

// Response
export { handleDocumentError, buildSuccessResponse } from "./response";

// Utils
export {
    fixThaiDistributed,
    generateUniqueFilename,
    getMimeType,
} from "./utils";
