import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PROJECT_STATUS } from "@/type/models";
import { getStatusColor, cn } from "@/lib/utils";
import type { Project } from "@/type";
import { ROUTES } from "@/lib/constants";
import { useUserDashboardContext } from "../contexts";
import { getProgramAccent } from "@/components/programAccent";
import { ProgramIdentityIcon } from "@/components/ProgramIdentityIcon";
import {
  Building2,
  FileText,
  Calendar,
  Pencil,
  Trash2,
  ChevronRight,
  Eye,
  FileUp,
  ClipboardList,
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
  const reportCount = project.reports?.length ?? 0;
  const programAccent = project.programName
    ? getProgramAccent({
        id: project.programId ?? project.programName,
        name: project.programName,
      })
    : null;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 sm:px-4">
      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(7.5rem,9.5rem)_5.5rem_6.5rem_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-1",
                programAccent
                  ? programAccent.icon
                  : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600",
              )}
            >
              {programAccent ? (
                <ProgramIdentityIcon accentKey={programAccent.key} />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
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
              {project.programName && programAccent ? (
                <span
                  className={cn(
                    "mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-900/60",
                    programAccent.text,
                  )}
                  title={project.programName}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      programAccent.dot,
                    )}
                  />
                  <span className="truncate">{project.programName}</span>
                </span>
              ) : null}
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

        <div className="flex min-w-0 flex-col items-start gap-1 text-xs font-medium text-slate-500 xl:justify-self-start dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>{project._count.files} เอกสาร</span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              hasUnreadReportUpdate && "text-orange-600 dark:text-orange-300",
            )}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>{reportCount} รายงาน</span>
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500 xl:justify-self-start dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {new Date(project.created_at).toLocaleDateString("th-TH")}
          </span>
        </div>

        <div className="grid min-w-0 grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap sm:justify-end xl:justify-self-end">
          <Button
            size="sm"
            variant="outline"
            onClick={onViewProjectFiles}
            className="h-11 w-full rounded-lg border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-sm transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:h-8 sm:w-auto"
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            ดูไฟล์
          </Button>
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
              className="h-11 w-full rounded-lg border-blue-100 bg-blue-50/70 px-2.5 text-xs font-bold text-blue-700 shadow-sm transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:shadow-md dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200 dark:hover:bg-blue-900/45 sm:h-8 sm:w-auto"
            >
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              รายงาน
            </Button>
          </div>
          <Button
            asChild
            size="sm"
            className="col-span-2 h-11 w-full rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 sm:col-span-1 sm:h-8 sm:w-auto"
          >
            <Link
              href={`${
                ROUTES.CREATE_DOCS
              }?projectId=${encodeURIComponent(project.id)}`}
            >
              จัดการเอกสาร
            </Link>
          </Button>
          <div className="col-span-2 flex items-center justify-end gap-1 border-t border-slate-100 pt-2 dark:border-slate-700 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-2 sm:pt-0">
            <button
              type="button"
              aria-label="แก้ไขโครงการ"
              onClick={onEditProject}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 sm:h-8 sm:w-8"
              title="แก้ไขโครงการ"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="ลบโครงการ"
              onClick={onDeleteProject}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 sm:h-8 sm:w-8"
              title="ลบโครงการ"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
