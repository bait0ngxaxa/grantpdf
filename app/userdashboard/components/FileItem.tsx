'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface AttachmentFile {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string | null;
}

interface FileItemProps {
    file: {
        id: string;
        originalFileName: string;
        fileExtension: string;
        created_at: string;
        storagePath: string;
        attachmentFiles?: AttachmentFile[];
    };
    onPreviewFile: (storagePath: string, fileName: string) => void;
    onDeleteFile: (fileId: string) => void;
}

// Utility function
const truncateFileName = (fileName: string, maxLength: number = 40): string => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);
    return `${truncatedName}...${extension}`;
};

export default function FileItem({ file, onPreviewFile, onDeleteFile }: FileItemProps) {
    const [isAttachmentExpanded, setIsAttachmentExpanded] = useState(false);

    return (
        <React.Fragment>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                        {file.fileExtension === 'pdf' ? (
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                                {truncateFileName(file.originalFileName, 40)}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 0h4a2 2 0 002-2V9a2 2 0 00-2-2h-4m-6-3h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                </svg>
                                {new Date(file.created_at).toLocaleDateString("th-TH")}
                            </span>
                            <span className="badge badge-outline text-xs">
                                {file.fileExtension.toUpperCase()}
                            </span>
                            {file.attachmentFiles && file.attachmentFiles.length > 0 && (
                                <button
                                    onClick={() => setIsAttachmentExpanded(!isAttachmentExpanded)}
                                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    {file.attachmentFiles.length} ไฟล์แนบ
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <a
                        href={`/api/user-docs/download/${file.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm bg-primary hover:bg-blue-600 text-white border-none rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                        title="ดาวน์โหลด"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </a>
                    {file.fileExtension === 'pdf' && (
                        <Button
                            onClick={() => onPreviewFile(file.storagePath, file.originalFileName)}
                            className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                            title="พรีวิว PDF"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </Button>
                    )}
                    <Button
                        onClick={() => onDeleteFile(file.id)}
                        className="btn btn-sm cursor-pointer text-white border-none rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                        variant="destructive"
                        title="ลบไฟล์"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.013 21H7.987a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
                    </Button>
                </div>
            </div>

            {/* Attachment Files */}
            {file.attachmentFiles && file.attachmentFiles.length > 0 && isAttachmentExpanded && (
                <div className="ml-8 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        ไฟล์แนบ ({file.attachmentFiles.length} ไฟล์)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {file.attachmentFiles.map((attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                        {attachment.mimeType?.includes('image') ? (
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        ) : attachment.mimeType?.includes('pdf') ? (
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={attachment.fileName}>
                                            {truncateFileName(attachment.fileName, 20)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={`/api/attachment/download/${attachment.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 ml-1 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors duration-200"
                                    title="ดาวน์โหลด"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}