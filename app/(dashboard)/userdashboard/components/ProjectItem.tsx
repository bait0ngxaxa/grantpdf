import React from "react";
import { Button } from "@/components/ui/button";
import FileItem from "./FileItem";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor } from "@/lib/utils";
import type { Project } from "@/type";
import { ROUTES } from "@/lib/constants";
import {
    Building2,
    FileText,
    Calendar,
    Pencil,
    Trash2,
    ChevronDown,
} from "lucide-react";

interface ProjectItemProps {
    project: Project;
    isExpanded: boolean;
    hasUnreadStatusNote: boolean;
    onToggleExpand: () => void;
    onEditProject: () => void;
    onDeleteProject: () => void;
    onStatusClick: (e: React.MouseEvent) => void;
    openPreviewModal: (url: string, title: string) => void;
    handleDeleteFile: (fileId: string) => void;
    router: AppRouterInstance;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
    project,
    isExpanded,
    hasUnreadStatusNote,
    onToggleExpand,
    onEditProject,
    onDeleteProject,
    onStatusClick,
    openPreviewModal,
    handleDeleteFile,
    router,
}): React.JSX.Element => {
    return (
        <div
            className={`group bg-white dark:bg-slate-800 rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden ${
                isExpanded
                    ? "border-blue-200 dark:border-blue-800 shadow-md ring-1 ring-blue-100 dark:ring-blue-900"
                    : "border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md"
            }`}
        >
            {/* Project Header */}
            <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer p-4 sm:p-6 transition-colors duration-200 gap-4"
                onClick={onToggleExpand}
            >
                <div className="flex items-start space-x-4 min-w-0">
                    <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${
                            isExpanded
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                : "bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/50 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                        }`}
                    >
                        <Building2 className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors break-words">
                            {project.name}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 break-words line-clamp-2 sm:line-clamp-1">
                            {project.description || "ไม่มีคำอธิบาย"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-md">
                                <FileText className="h-3.5 w-3.5 mr-1.5" />
                                {project.files.length} เอกสาร
                            </div>
                            <div className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-md">
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                {new Date(
                                    project.created_at,
                                ).toLocaleDateString("th-TH")}
                            </div>
                            {/* Mobile Status Badge */}
                            <div className="sm:hidden relative">
                                {hasUnreadStatusNote && (
                                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                                    </span>
                                )}
                                <button
                                    onClick={onStatusClick}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(
                                        project.status ||
                                            PROJECT_STATUS.IN_PROGRESS,
                                    )}`}
                                    title="คลิกเพื่อดูรายละเอียดสถานะ"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
                                    {project.status ||
                                        PROJECT_STATUS.IN_PROGRESS}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-16 sm:pl-0">
                    {/* Desktop Status Badge */}
                    <div className="hidden sm:block relative">
                        {hasUnreadStatusNote && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                            </span>
                        )}
                        <button
                            onClick={onStatusClick}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(
                                project.status || PROJECT_STATUS.IN_PROGRESS,
                            )}`}
                            title="คลิกเพื่อดูรายละเอียดสถานะ"
                        >
                            <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-75" />
                            {project.status || PROJECT_STATUS.IN_PROGRESS}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center sm:pl-4 sm:border-l border-slate-100 dark:border-slate-700 space-x-1 sm:space-x-3">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                    `${
                                        ROUTES.CREATE_DOCS
                                    }?projectId=${encodeURIComponent(
                                        project.id,
                                    )}`,
                                );
                            }}
                            size="sm"
                            variant="outline"
                            className="hidden md:flex rounded-xl border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all font-semibold"
                        >
                            จัดการ/เพิ่มเอกสาร
                        </Button>

                        <div className="flex space-x-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditProject();
                                }}
                                className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                title="แก้ไขโครงการ"
                            >
                                <Pencil className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteProject();
                                }}
                                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                title="ลบโครงการ"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Expand Arrow */}
                    <div
                        className={`p-2 rounded-full flex-shrink-0 transition-transform duration-300 ${
                            isExpanded
                                ? "bg-slate-100 dark:bg-slate-700 rotate-180"
                                : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                        }`}
                    >
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Expanded Content (Files) */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded
                        ? "max-h-[1000px] opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >
                <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-6">
                    {project.files.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center">
                                    <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 p-1.5 rounded-lg mr-2">
                                        <FileText className="h-4 w-4" />
                                    </span>
                                    รายการเอกสารในโครงการ
                                </div>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                            `/createdocs?projectId=${encodeURIComponent(
                                                project.id,
                                            )}`,
                                        );
                                    }}
                                    size="sm"
                                    className="h-8 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-700 shadow-sm"
                                >
                                    + เพิ่มเอกสาร
                                </Button>
                            </div>
                            <div className="grid gap-3">
                                {project.files.map((file) => (
                                    <FileItem
                                        key={file.id}
                                        file={file}
                                        onPreviewFile={openPreviewModal}
                                        onDeleteFile={handleDeleteFile}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-600">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-500" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                ยังไม่มีเอกสารในโครงการ
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 mt-1">
                                เริ่มต้นสร้างเอกสารสัญญา TOR หรือบันทึกข้อความ
                            </p>
                            <Button
                                onClick={() => {
                                    router.push(
                                        `/createdocs?projectId=${encodeURIComponent(
                                            project.id,
                                        )}`,
                                    );
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
    );
};
