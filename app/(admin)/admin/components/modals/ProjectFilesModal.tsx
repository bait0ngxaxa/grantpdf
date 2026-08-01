"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, FolderOpen, X } from "lucide-react";
import { FileListSkeleton } from "@/components/ui/FileListSkeleton";
import type { AdminProject } from "@/type/models";
import { API_ROUTES } from "@/lib/shared/constants";
import FileItem from "../project/FileItem";
import { cn, getStatusColor } from "@/lib/shared/utils";
import {
  fetchAllProjectFiles,
  type ProjectFilesResponse,
} from "@/lib/client/projects/filesClient";

interface ProjectFilesModalProps {
  isOpen: boolean;
  project: AdminProject | null;
  onClose: () => void;
}

export const ProjectFilesModal: React.FC<ProjectFilesModalProps> = ({
  isOpen,
  project,
  onClose,
}) => {
  const [displayedProject, setDisplayedProject] = React.useState(project);
  const handleOpenAutoFocus = React.useCallback((_event: Event): void => {
    if (project) {
      setDisplayedProject(project);
    }
  }, [project]);

  const renderedProject = project ?? displayedProject;
  const fallbackFiles = useMemo(
    () => renderedProject?.files || [],
    [renderedProject?.files],
  );
  const filesKey =
    isOpen && project ? [API_ROUTES.ADMIN_FILES, project.id] : null;
  const {
    data: filesData,
    error: projectFilesError,
    isLoading: isLoadingFiles,
  } = useSWR<ProjectFilesResponse>(
    filesKey,
    ([basePath, projectId]: [string, string]) =>
      fetchAllProjectFiles(basePath, projectId),
    { keepPreviousData: true },
  );

  const visibleFiles = filesData?.files ?? fallbackFiles;
  const fileCount = isLoadingFiles
    ? (renderedProject?._count.files ?? visibleFiles.length)
    : visibleFiles.length;
  const filesError = projectFilesError ? "ไม่สามารถโหลดไฟล์ล่าสุดได้" : null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {renderedProject && (
        <DialogContent
          onOpenAutoFocus={handleOpenAutoFocus}
          showCloseButton={false}
          className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border border-slate-100 bg-white p-0 shadow-[0_8px_14px_rgba(15,23,42,0.12)] sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-5xl dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_8px_14px_rgba(0,0,0,0.32)]"
        >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 dark:border-slate-700">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle
                  className="whitespace-normal break-words text-xl leading-7 font-bold text-slate-800 [overflow-wrap:anywhere] dark:text-slate-100"
                  title={renderedProject.name}
                >
                  {renderedProject.name}
                </DialogTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <DialogDescription asChild>
                    <span title={renderedProject.userName}>
                      {renderedProject.userName}
                    </span>
                  </DialogDescription>
                  {renderedProject.programName && (
                    <span
                      className="inline-flex max-w-full items-center truncate rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                      title={renderedProject.programName}
                    >
                      {renderedProject.programName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="ปิดหน้าต่างรายการเอกสาร"
              className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-6 dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 font-medium shadow-sm dark:bg-slate-800">
              <FileText className="mr-1.5 h-4 w-4" />
              {fileCount} ไฟล์
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 font-semibold shadow-sm",
                getStatusColor(renderedProject.status),
              )}
            >
              สถานะ: {renderedProject.status}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {filesError && (
            <p className="mb-3 rounded-2xl bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              {filesError}
            </p>
          )}
          {isLoadingFiles && visibleFiles.length === 0 ? (
            <FileListSkeleton label="กำลังโหลดไฟล์..." />
          ) : visibleFiles.length > 0 ? (
            <div className="space-y-3">
              {visibleFiles.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-slate-600 dark:bg-slate-900/30">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
                <FileText className="h-7 w-7" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
                ยังไม่มีไฟล์ในโครงการ
              </h4>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                โครงการนี้ยังไม่มีการสร้างหรืออัปโหลดเอกสาร
              </p>
            </div>
          )}
        </div>
        </DialogContent>
      )}
    </Dialog>
  );
};
