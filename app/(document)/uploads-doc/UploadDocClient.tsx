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

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="p-4 sm:p-5 lg:p-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
                            {/* Left Column - Project Selection */}
                            <ProjectList
                                projects={projects}
                                selectedProjectId={selectedProjectId}
                                onSelectProject={setSelectedProjectId}
                                isLoading={isLoadingProjects}
                                error={projectError}
                            />

                            {/* Right Column - Upload Area */}
                            <div className="min-w-0 lg:border-l lg:border-dashed lg:border-gray-200 lg:pl-8 dark:lg:border-slate-700">
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
