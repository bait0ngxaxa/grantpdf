"use client";

import React, { useState } from "react";
import type { AttachmentFile } from "@/type/models";
import { truncateFileName } from "@/lib/utils";
import { useSignedDownload } from "@/lib/hooks/useSignedDownload";
import {
    FileText,
    File,
    Calendar,
    Paperclip,
    Download,
    Eye,
    Trash2,
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
        attachmentFiles?: AttachmentFile[];
    };
}

export default function FileItem({ file }: FileItemProps): React.JSX.Element {
    const { openPreviewModal, handleDeleteFile } = useUserDashboardContext();
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
                            <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(file.created_at).toLocaleDateString(
                                    "th-TH",
                                )}
                            </span>
                            <span className="badge badge-outline text-xs">
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
                                        className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        <Paperclip className="w-3 h-3 mr-1" />
                                        {file.attachmentFiles.length} ไฟล์แนบ
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
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                        title="ดาวน์โหลด"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    {file.fileExtension === "pdf" && (
                        <button
                            onClick={() =>
                                openPreviewModal(
                                    file.storagePath,
                                    file.originalFileName,
                                )
                            }
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="พรีวิว PDF"
                        >
                            <Eye className="h-5 w-5" />
                        </button>
                    )}
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
                    <div className="mt-2 sm:ml-11">
                        <AttachmentList
                            attachmentFiles={file.attachmentFiles}
                        />
                    </div>
                )}
        </React.Fragment>
    );
}
