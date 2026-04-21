"use client";

import { useSearchParams } from "next/navigation";
import { type UseUploadDocReturn } from "./types";
import { useUploadState } from "./useUploadState";
import { useProjectList } from "./useProjectList";
import { useFileHandlers } from "./useFileHandlers";
import { useFileUpload } from "./useFileUpload";

export type { UseUploadDocReturn } from "./types";

export function useUploadDoc(): UseUploadDocReturn {
    const searchParams = useSearchParams();

    // Upload state
    const {
        selectedFile,
        setSelectedFile,
        isUploading,
        setIsUploading,
        uploadMessage,
        setUploadMessage,
        uploadSuccess,
        setUploadSuccess,
        fileInputRef,
    } = useUploadState();

    // Project list
    const {
        projects,
        selectedProjectId,
        setSelectedProjectId,
        isLoadingProjects,
        projectError,
    } = useProjectList({
        initialProjectId: searchParams.get("projectId"),
    });

    // File handlers
    const { handleFileSelect, handleDragOver, handleDrop } = useFileHandlers({
        setSelectedFile,
        setUploadMessage,
        setUploadSuccess,
    });

    // File upload
    const { handleUpload } = useFileUpload({
        selectedFile,
        selectedProjectId,
        fileInputRef,
        setIsUploading,
        setUploadMessage,
        setUploadSuccess,
        setSelectedFile,
    });

    return {
        fileInputRef,
        selectedFile,
        isUploading,
        uploadMessage,
        uploadSuccess,
        projects,
        selectedProjectId,
        setSelectedProjectId,
        isLoadingProjects,
        projectError,
        handleFileSelect,
        handleDragOver,
        handleDrop,
        handleUpload,
        setSelectedFile,
    };
}
