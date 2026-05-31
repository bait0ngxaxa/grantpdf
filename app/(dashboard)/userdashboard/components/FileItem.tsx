"use client";

import React, { useState } from "react";
import type { AttachmentFile } from "@/type/models";
import { truncateFileName, cn } from "@/lib/utils";
import { useSignedDownload } from "@/lib/hooks/useSignedDownload";
import {
    FileText,
    File,
    Calendar,
    Paperclip,
    ChevronDown,
    Download,
    Loader2,
    Trash2,
    User,
} from "lucide-react";
import { useUserDashboardContext } from "../contexts";
import { AttachmentList } from "@/components/ui/AttachmentList";

interface FileItemProps {
    file: {
        id: string;
        originalFileName: string;
        fileExtension: string;
        created_at: string;
        storagePath: string;
        userName?: string;
        userEmail?: string;
        attachmentFiles?: AttachmentFile[];
    };
}

export default function FileItem({ file }: FileItemProps): React.JSX.Element {
    const { handleDeleteFile } = useUserDashboardContext();
    const [isAttachmentExpanded, setIsAttachmentExpanded] = useState(false);
    const { download, isDownloading } = useSignedDownload();

    const getFileIcon = (extension: string): React.JSX.Element => {
        if (extension === "pdf") {
            return <File className="w-8 h-8 text-red-500" />;
        } else if (extension === "xlsx") {
            return <FileText className="w-8 h-8 text-green-600" />;
        }
        return <FileText className="w-8 h-8 text-blue-500" />;
    };

    return (
        <React.Fragment>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors duration-200 gap-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                        {getFileIcon(file.fileExtension)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900 dark:text-slate-100 truncate break-all">
                                {truncateFileName(file.originalFileName, 40)}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center min-w-0">
                                <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                    เจ้าของไฟล์: {file.userName || "ไม่ระบุ"}
                                </span>
                            </span>
                            <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(file.created_at).toLocaleDateString(
                                    "th-TH",
                                )}
                            </span>
                            <span className="inline-flex text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                {file.fileExtension.toUpperCase()}
                            </span>
                            {file.attachmentFiles &&
                                file.attachmentFiles.length > 0 && (
                                    <button
                                        onClick={() =>
                                            setIsAttachmentExpanded(
                                                !isAttachmentExpanded,
                                            )
                                        }
                                        className="flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full"
                                    >
                                        <Paperclip className="w-3 h-3 mr-1" />
                                        {file.attachmentFiles.length} ไฟล์แนบ
                                        <ChevronDown
                                            className={cn(
                                                "w-3.5 h-3.5 ml-1 transform transition-transform duration-200",
                                                isAttachmentExpanded && "rotate-180",
                                            )}
                                        />
                                    </button>
                                )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 pl-11 sm:pl-0">
                    <button
                        onClick={() =>
                            download({ fileId: file.id, type: "userFile" })
                        }
                        disabled={isDownloading}
                        aria-busy={isDownloading}
                        aria-label={
                            isDownloading ? "กำลังดาวน์โหลด" : "ดาวน์โหลด"
                        }
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:cursor-progress disabled:opacity-60"
                        title={isDownloading ? "กำลังดาวน์โหลด…" : "ดาวน์โหลด"}
                    >
                        {isDownloading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Download className="h-5 w-5" />
                        )}
                    </button>
                    <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="ลบไฟล์"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Attachment Files */}
            {file.attachmentFiles &&
                file.attachmentFiles.length > 0 &&
                isAttachmentExpanded && (
                    <div className="mt-2 w-full">
                        <AttachmentList
                            attachmentFiles={file.attachmentFiles}
                        />
                    </div>
                )}
        </React.Fragment>
    );
}
