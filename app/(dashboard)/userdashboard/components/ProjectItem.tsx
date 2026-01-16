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
}) => {
    return (
        <div
            className={`group bg-white rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden ${
                isExpanded
                    ? "border-blue-200 shadow-md ring-1 ring-blue-100"
                    : "border-slate-100 hover:border-blue-200 hover:shadow-md"
            }`}
        >
            {/* Project Header */}
            <div
                className="flex items-center justify-between cursor-pointer p-6 transition-colors duration-200"
                onClick={onToggleExpand}
            >
                <div className="flex items-center space-x-5">
                    <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                            isExpanded
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                        }`}
                    >
                        <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-slate-500 text-sm mb-3 max-w-xl truncate">
                            {project.description || "ไม่มีคำอธิบาย"}
                        </p>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                <FileText className="h-3.5 w-3.5 mr-1.5" />
                                {project.files.length} เอกสาร
                            </div>
                            <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                {new Date(
                                    project.created_at
                                ).toLocaleDateString("th-TH")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <div className="hidden md:block relative">
                        {hasUnreadStatusNote && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                        )}
                        <button
                            onClick={onStatusClick}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(
                                project.status || PROJECT_STATUS.IN_PROGRESS
                            )}`}
                            title="คลิกเพื่อดูรายละเอียดสถานะ"
                        >
                            <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-75"></span>
                            {project.status || PROJECT_STATUS.IN_PROGRESS}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center pl-4 border-l border-slate-100 space-x-3">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                    `${
                                        ROUTES.CREATE_DOCS
                                    }?projectId=${encodeURIComponent(
                                        project.id
                                    )}`
                                );
                            }}
                            size="sm"
                            variant="outline"
                            className="hidden sm:flex rounded-xl border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all font-semibold"
                        >
                            จัดการ/เพิ่มเอกสาร
                        </Button>

                        <div className="flex space-x-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditProject();
                                }}
                                className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors duration-200"
                                title="แก้ไขโครงการ"
                            >
                                <Pencil className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteProject();
                                }}
                                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors duration-200"
                                title="ลบโครงการ"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Expand Arrow */}
                    <div
                        className={`p-2 rounded-full transition-transform duration-300 ${
                            isExpanded
                                ? "bg-slate-100 rotate-180"
                                : "bg-white text-slate-400"
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
                <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                    {project.files.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm font-bold text-slate-700 flex items-center">
                                    <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2">
                                        <FileText className="h-4 w-4" />
                                    </span>
                                    รายการเอกสารในโครงการ
                                </div>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                            `/createdocs?projectId=${encodeURIComponent(
                                                project.id
                                            )}`
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
                                        onPreviewFile={openPreviewModal}
                                        onDeleteFile={handleDeleteFile}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800">
                                ยังไม่มีเอกสารในโครงการ
                            </h3>
                            <p className="text-xs text-slate-500 mb-4 mt-1">
                                เริ่มต้นสร้างเอกสารสัญญา TOR หรือบันทึกข้อความ
                            </p>
                            <Button
                                onClick={() => {
                                    router.push(
                                        `/createdocs?projectId=${encodeURIComponent(
                                            project.id
                                        )}`
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
