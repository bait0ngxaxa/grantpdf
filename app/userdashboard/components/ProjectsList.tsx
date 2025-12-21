import React from "react";
import { Button } from "@/components/ui/button";
import FileItem from "./FileItem";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor } from "@/lib/utils";
import type { Project } from "../hooks/useUserData";

interface ProjectsListProps {
    projects: Project[];
    totalProjects: number;
    expandedProjects: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;
    handleEditProject: (project: Project) => void;
    handleDeleteProject: (projectId: string) => void;
    openPreviewModal: (url: string, title: string) => void;
    handleDeleteFile: (fileId: string) => void;
    setShowCreateProjectModal: (show: boolean) => void;
    router: AppRouterInstance;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
    projects,
    totalProjects,
    expandedProjects,
    toggleProjectExpansion,
    handleEditProject,
    handleDeleteProject,
    openPreviewModal,
    handleDeleteFile,
    setShowCreateProjectModal,
    router,
    currentPage,
    totalPages,
    onPageChange,
}) => {
    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                    </span>
                    โครงการทั้งหมด
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {totalProjects}
                    </span>
                </h2>
                <Button
                    onClick={() => setShowCreateProjectModal(true)}
                    className="cursor-pointer transform hover:scale-105 transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/30"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    สร้างโครงการใหม่
                </Button>
            </div>
            <div className="space-y-6">
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <div
                            key={project.id}
                            className={`group bg-white rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden ${
                                expandedProjects.has(project.id)
                                    ? "border-blue-200 shadow-md ring-1 ring-blue-100"
                                    : "border-slate-100 hover:border-blue-200 hover:shadow-md"
                            }`}
                        >
                            <div
                                className="flex items-center justify-between cursor-pointer p-6 transition-colors duration-200"
                                onClick={() =>
                                    toggleProjectExpansion(project.id)
                                }
                            >
                                <div className="flex items-center space-x-5">
                                    <div
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                                            expandedProjects.has(project.id)
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                                        }`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-7 w-7"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm mb-3 max-w-xl truncate">
                                            {project.description ||
                                                "ไม่มีคำอธิบาย"}
                                        </p>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-3.5 w-3.5 mr-1.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                {project.files.length} เอกสาร
                                            </div>
                                            <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-3.5 w-3.5 mr-1.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                {new Date(
                                                    project.created_at
                                                ).toLocaleDateString("th-TH")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="hidden md:block">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(
                                                project.status ||
                                                    PROJECT_STATUS.IN_PROGRESS
                                            )}`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-75"></span>
                                            {project.status ||
                                                PROJECT_STATUS.IN_PROGRESS}
                                        </span>
                                    </div>

                                    <div className="flex items-center pl-4 border-l border-slate-100 space-x-3">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                localStorage.setItem(
                                                    "selectedProjectId",
                                                    project.id
                                                );
                                                router.push("/createdocs");
                                            }}
                                            size="sm"
                                            variant="outline"
                                            className="hidden sm:flex rounded-xl border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all font-semibold"
                                        >
                                            จัดการเอกสาร
                                        </Button>

                                        <div className="flex space-x-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditProject(project);
                                                }}
                                                className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors duration-200"
                                                title="แก้ไขโครงการ"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProject(
                                                        project.id
                                                    );
                                                }}
                                                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors duration-200"
                                                title="ลบโครงการ"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div
                                        className={`p-2 rounded-full transition-transform duration-300 ${
                                            expandedProjects.has(project.id)
                                                ? "bg-slate-100 rotate-180"
                                                : "bg-white text-slate-400"
                                        }`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content (Files) */}
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                    expandedProjects.has(project.id)
                                        ? "max-h-[1000px] opacity-100"
                                        : "max-h-0 opacity-0"
                                }`}
                            >
                                <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                                    {project.files.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-sm font-bold text-slate-700 flex items-center">
                                                    <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                    </span>
                                                    รายการเอกสารในโครงการ
                                                </div>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        localStorage.setItem(
                                                            "selectedProjectId",
                                                            project.id
                                                        );
                                                        router.push(
                                                            "/createdocs"
                                                        );
                                                    }}
                                                    size="sm"
                                                    className="h-8 text-xs bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm"
                                                >
                                                    + เพิ่มเอกสาร
                                                </Button>
                                            </div>
                                            <div className="grid gap-3">
                                                {project.files.map((file) => (
                                                    <FileItem
                                                        key={file.id}
                                                        file={file}
                                                        onPreviewFile={
                                                            openPreviewModal
                                                        }
                                                        onDeleteFile={
                                                            handleDeleteFile
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-8 w-8 text-slate-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                ยังไม่มีเอกสารในโครงการ
                                            </h3>
                                            <p className="text-xs text-slate-500 mb-4 mt-1">
                                                เริ่มต้นสร้างเอกสารสัญญา TOR
                                                หรือบันทึกข้อความ
                                            </p>
                                            <Button
                                                onClick={() => {
                                                    localStorage.setItem(
                                                        "selectedProjectId",
                                                        project.id
                                                    );
                                                    router.push("/createdocs");
                                                }}
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-200"
                                            >
                                                สร้างเอกสารแรก
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-blue-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            ยังไม่มีโครงการ
                        </h3>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                            เริ่มต้นใช้งานระบบโดยการสร้างโครงการใหม่เพื่อจัดการเอกสารของคุณ
                        </p>
                        <Button
                            onClick={() => setShowCreateProjectModal(true)}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-blue-500/30 border-0"
                        >
                            สร้างโครงการแรกของคุณ
                        </Button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-10">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        {/* Previous Button */}
                        <button
                            onClick={() =>
                                onPageChange(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                                currentPage === 1
                                    ? "text-slate-300 cursor-not-allowed"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>

                        {/* Page Numbers */}
                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                                    currentPage === page
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() =>
                                onPageChange(
                                    Math.min(totalPages, currentPage + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                                currentPage === totalPages
                                    ? "text-slate-300 cursor-not-allowed"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
