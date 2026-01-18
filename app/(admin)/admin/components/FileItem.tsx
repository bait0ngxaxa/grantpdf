"use client";

import React, { useState } from "react";
import { Button, AttachmentList } from "@/components/ui";
import type { AdminDocumentFile } from "@/type/models";
import { truncateFileName } from "@/lib/utils";
import { useSignedDownload } from "@/lib/hooks/useSignedDownload";
import {
    File,
    FileText,
    Calendar,
    Paperclip,
    ChevronDown,
    Download,
    Eye,
} from "lucide-react";

interface FileItemProps {
    file: AdminDocumentFile;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
}

export default function FileItem({
    file,
    onPreviewPdf,
}: FileItemProps): React.JSX.Element {
    const [isAttachmentExpanded, setIsAttachmentExpanded] = useState(false);
    const { download, isDownloading } = useSignedDownload();

    const toggleAttachmentExpansion = (): void => {
        setIsAttachmentExpanded(!isAttachmentExpanded);
    };

    const getFileIcon = (): React.JSX.Element => {
        if (file.fileExtension === "pdf") {
            return (
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                    <File className="w-6 h-6" />
                </div>
            );
        } else if (file.fileExtension === "xlsx") {
            return (
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <FileText className="w-6 h-6" />
                </div>
            );
        }
        return (
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                <FileText className="w-6 h-6" />
            </div>
        );
    };

    return (
        <React.Fragment>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-blue-100 hover:shadow-sm transition-all duration-200 group gap-3">
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    {/* File Icon */}
                    <div className="flex-shrink-0">{getFileIcon()}</div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm sm:text-base font-semibold text-slate-800 break-words">
                                {truncateFileName(file.originalFileName, 30)}
                            </span>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                                    file.downloadStatus === "done"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-amber-100 text-amber-700"
                                }`}
                            >
                                {file.downloadStatus === "done"
                                    ? "เสร็จสิ้น"
                                    : "ใหม่"}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                {new Date(file.created_at).toLocaleDateString(
                                    "th-TH",
                                )}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase font-medium">
                                {file.fileExtension}
                            </span>
                            {file.attachmentFiles &&
                                file.attachmentFiles.length > 0 && (
                                    <button
                                        onClick={toggleAttachmentExpansion}
                                        className="flex items-center text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200 bg-blue-50 px-2 py-0.5 rounded-full"
                                    >
                                        <Paperclip className="w-3.5 h-3.5 mr-1" />
                                        {file.attachmentFiles.length} ไฟล์แนบ
                                        <ChevronDown
                                            className={`w-3.5 h-3.5 ml-1 transform transition-transform duration-200 ${
                                                isAttachmentExpanded
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </button>
                                )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0 pl-12 sm:pl-0">
                    {file.storagePath && (
                        <button
                            onClick={() =>
                                download({
                                    fileId: file.id,
                                    type: "userFile",
                                    fromAdminPanel: true,
                                })
                            }
                            disabled={isDownloading}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 bg-slate-50 hover:bg-blue-100 hover:text-blue-600 transition-colors disabled:opacity-50"
                            title="ดาวน์โหลด"
                        >
                            <Download className="h-4 w-4" />
                        </button>
                    )}
                    {file.fileExtension === "pdf" && (
                        <Button
                            onClick={() => {
                                if (file.storagePath) {
                                    onPreviewPdf(
                                        file.storagePath,
                                        file.originalFileName,
                                    );
                                }
                            }}
                            size="sm"
                            className="h-8 w-8 p-0 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-none shadow-none"
                            title="พรีวิว PDF"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Attachment Files Section - แสดงเฉพาะเมื่อกดปุ่มไฟล์แนบ */}
            {file.attachmentFiles &&
                file.attachmentFiles.length > 0 &&
                isAttachmentExpanded && (
                    <div className="mt-3">
                        <AttachmentList
                            attachmentFiles={file.attachmentFiles}
                            isExpanded={isAttachmentExpanded}
                            onToggleExpand={toggleAttachmentExpansion}
                        />
                    </div>
                )}
        </React.Fragment>
    );
}
