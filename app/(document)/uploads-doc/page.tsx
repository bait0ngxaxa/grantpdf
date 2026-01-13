"use client";

import { useTitle } from "@/lib/hooks/useTitle";
import { useUploadDoc } from "@/app/(document)/hooks/useUploadDoc";
import { UploadHeader } from "@/app/(document)/components/upload-form/UploadHeader";
import { ProjectList } from "@/app/(document)/components/upload-form/ProjectList";
import { UploadArea } from "@/app/(document)/components/upload-form/UploadArea";

export default function UploadDocPage() {
    useTitle("อัพโหลดเอกสาร | ระบบจัดการเอกสาร");

    const {
        session,
        status,
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
        router,
        setSelectedFile,
    } = useUploadDoc();

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) {
        router.push("/signin");
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <UploadHeader />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                            <div className="lg:border-l lg:pl-12 lg:border-dashed lg:border-gray-200">
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
