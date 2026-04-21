"use client";

import { UploadHeader } from "@/app/(document)/components/upload-form/UploadHeader";
import { ProjectList } from "@/app/(document)/components/upload-form/ProjectList";
import { UploadArea } from "@/app/(document)/components/upload-form/UploadArea";
import { useUploadDoc } from "@/app/(document)/hooks/useUploadDoc";

export default function UploadDocClient(): React.JSX.Element {
    const {
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
    } = useUploadDoc();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans">
            <UploadHeader />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Left Column - Project Selection */}
                            <ProjectList
                                projects={projects}
                                selectedProjectId={selectedProjectId}
                                onSelectProject={setSelectedProjectId}
                                isLoading={isLoadingProjects}
                                error={projectError}
                            />

                            {/* Right Column - Upload Area */}
                            <div className="lg:border-l lg:pl-12 lg:border-dashed lg:border-gray-200 dark:lg:border-slate-700">
                                <UploadArea
                                    fileInputRef={fileInputRef}
                                    selectedFile={selectedFile}
                                    isUploading={isUploading}
                                    uploadMessage={uploadMessage}
                                    uploadSuccess={uploadSuccess}
                                    hasSelectedProject={!!selectedProjectId}
                                    onFileSelect={handleFileSelect}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onUpload={handleUpload}
                                    onClearFile={() => setSelectedFile(null)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
