import { type ChangeEvent, type DragEvent } from "react";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { type Session } from "next-auth";
import type { Project } from "@/type";

// =====================================================
// Project Types
// =====================================================

export type ProjectListItem = Pick<
    Project,
    "id" | "name" | "description" | "created_at"
>;

// =====================================================
// Return Types
// =====================================================

export interface UseUploadDocReturn {
    session: Session | null;
    status: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    selectedFile: File | null;
    isUploading: boolean;
    uploadMessage: string;
    uploadSuccess: boolean;
    projects: ProjectListItem[];
    selectedProjectId: string | null;
    setSelectedProjectId: React.Dispatch<React.SetStateAction<string | null>>;
    isLoadingProjects: boolean;
    projectError: string | null;
    handleFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
    handleDragOver: (event: DragEvent<HTMLDivElement>) => void;
    handleDrop: (event: DragEvent<HTMLDivElement>) => void;
    handleUpload: () => Promise<void>;
    router: AppRouterInstance;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
}

// =====================================================
// Sub-hook Props Types
// =====================================================

export interface UploadStateReturn {
    selectedFile: File | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
    isUploading: boolean;
    setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
    uploadMessage: string;
    setUploadMessage: React.Dispatch<React.SetStateAction<string>>;
    uploadSuccess: boolean;
    setUploadSuccess: React.Dispatch<React.SetStateAction<boolean>>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export interface ProjectListReturn {
    projects: ProjectListItem[];
    selectedProjectId: string | null;
    setSelectedProjectId: React.Dispatch<React.SetStateAction<string | null>>;
    isLoadingProjects: boolean;
    projectError: string | null;
}

export interface FileHandlersProps {
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
    setUploadMessage: React.Dispatch<React.SetStateAction<string>>;
    setUploadSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface FileUploadProps {
    selectedFile: File | null;
    selectedProjectId: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
    setUploadMessage: React.Dispatch<React.SetStateAction<string>>;
    setUploadSuccess: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
}
