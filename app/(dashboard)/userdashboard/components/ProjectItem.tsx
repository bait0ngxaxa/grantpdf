import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor, cn } from "@/lib/utils";
import type { Project } from "@/type";
import { ROUTES } from "@/lib/constants";
import { useUserDashboardContext } from "../contexts";
import {
  Building2,
  FileText,
  Calendar,
  Pencil,
  Trash2,
  ChevronRight,
  Eye,
  FileUp,
} from "lucide-react";

interface ProjectItemProps {
  project: Project;
  hasUnreadStatusNote: boolean;
  hasUnreadReportUpdate: boolean;
  onStatusClick: () => void;
  onReportClick: () => void;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  hasUnreadStatusNote,
  hasUnreadReportUpdate,
  onStatusClick,
  onReportClick,
}): React.JSX.Element => {
  const {
    handleEditProject,
    handleDeleteProject,
    openProjectFilesModal,
  } = useUserDashboardContext();

  const onEditProject = () => handleEditProject(project);
  const onDeleteProject = () => handleDeleteProject(project.id);
  const onViewProjectFiles = () => openProjectFilesModal(project);
  const statusClassName = getStatusColor(
    project.status || PROJECT_STATUS.IN_PROGRESS,
  );

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 sm:px-4">
      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(7.5rem,9.5rem)_5.5rem_6.5rem_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="line-clamp-2 text-sm font-bold break-words text-slate-800 dark:text-slate-100"
                title={project.name}
              >
                {project.name}
              </h3>
              <p
                className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400"
                title={project.description || "ไม่มีคำอธิบาย"}
              >
                {project.description || "ไม่มีคำอธิบาย"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative min-w-0 xl:justify-self-center">
          {hasUnreadStatusNote && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
            </span>
          )}
          <button
            type="button"
            onClick={onStatusClick}
            className={cn(
              "group/status inline-flex max-w-full min-w-0 items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm transition-[transform,box-shadow,background-color,color,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none sm:min-w-[7.5rem]",
              statusClassName,
            )}
            title="ดูรายละเอียดสถานะ"
            aria-label={`ดูรายละเอียดสถานะโครงการ: ${
              project.status || PROJECT_STATUS.IN_PROGRESS
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
            <span className="min-w-0 break-words">
              {project.status || PROJECT_STATUS.IN_PROGRESS}
            </span>
            <ChevronRight className="h-3.5 w-3.5 opacity-80 transition-transform duration-200 group-hover/status:translate-x-0.5" />
          </button>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500 xl:justify-self-start dark:text-slate-400">
          <FileText className="h-3.5 w-3.5" />
          <span>{project._count.files} เอกสาร</span>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500 xl:justify-self-start dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {new Date(project.created_at).toLocaleDateString("th-TH")}
          </span>
        </div>

        <div className="grid min-w-0 grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap xl:justify-self-end">
          <div className="relative min-w-0">
            {hasUnreadReportUpdate && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onReportClick}
              className="h-auto min-h-8 w-full rounded-xl border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 sm:w-auto"
            >
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              รายงาน
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onViewProjectFiles}
            className="h-auto min-h-8 w-full rounded-xl border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 sm:w-auto"
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            ดูไฟล์
          </Button>
          <Button
            asChild
            size="sm"
            className="col-span-2 h-auto min-h-8 w-full rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 sm:col-span-1 sm:w-auto"
          >
            <Link
              href={`${
                ROUTES.CREATE_DOCS
              }?projectId=${encodeURIComponent(project.id)}`}
            >
              จัดการเอกสาร
            </Link>
          </Button>
          <button
            type="button"
            aria-label="แก้ไขโครงการ"
            onClick={onEditProject}
            className="rounded-xl p-2 text-slate-400 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            title="แก้ไขโครงการ"
          >
            <Pencil className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            aria-label="ลบโครงการ"
            onClick={onDeleteProject}
            className="rounded-xl p-2 text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            title="ลบโครงการ"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
