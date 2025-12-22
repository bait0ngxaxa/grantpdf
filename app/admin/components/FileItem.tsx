"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AttachmentList from "./AttachmentList";
import type { AdminPdfFile } from "@/type/models";
import { truncateFileName } from "@/lib/utils";

interface FileItemProps {
    file: AdminPdfFile;
    onPreviewPdf: (storagePath: string, fileName: string) => void;
    onDeleteFile: (file: AdminPdfFile) => void;
}

export default function FileItem({
    file,
    onPreviewPdf,
    onDeleteFile,
}: FileItemProps) {
    const [isAttachmentExpanded, setIsAttachmentExpanded] = useState(false);

    const toggleAttachmentExpansion = () => {
        setIsAttachmentExpanded(!isAttachmentExpanded);
    };

    return (
        <React.Fragment>
            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-blue-100 hover:shadow-sm transition-all duration-200 group">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                        {file.fileExtension === "pdf" ? (
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        ) : file.fileExtension === "xlsx" ? (
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 2a1 1 0 000 2h6a1 1 0 100-2H9zM4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 10l4 4m0-4l-4 4"
                                    />
                                </svg>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <span className="text-base font-semibold text-slate-800 truncate">
                                {truncateFileName(file.originalFileName, 40)}
                            </span>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
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
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5 mr-1.5 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
                                    />
                                </svg>
                                {new Date(file.created_at).toLocaleDateString(
                                    "th-TH"
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
                                        <svg
                                            className="w-3.5 h-3.5 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                            />
                                        </svg>
                                        {file.attachmentFiles.length} ไฟล์แนบ
                                        <svg
                                            className={`w-3.5 h-3.5 ml-1 transform transition-transform duration-200 ${
                                                isAttachmentExpanded
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    {file.storagePath && (
                        <a
                            href={`/api/admin/download/${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            title="ดาวน์โหลด"
                        >
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
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                        </a>
                    )}
                    {file.fileExtension === "pdf" && (
                        <Button
                            onClick={() =>
                                onPreviewPdf(
                                    file.storagePath!,
                                    file.originalFileName
                                )
                            }
                            size="sm"
                            className="h-8 w-8 p-0 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-none shadow-none"
                            title="พรีวิว PDF"
                        >
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        </Button>
                    )}
                    <Button
                        onClick={() => onDeleteFile(file)}
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none"
                        variant="destructive"
                        title="ลบไฟล์"
                    >
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
                                d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </Button>
                </div>
            </div>

            {/* Attachment Files Section */}
            {file.attachmentFiles && file.attachmentFiles.length > 0 && (
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
