"use client";

import { useSignedDownload } from "@/hooks/useSignedDownload";

interface AttachmentFile {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string | null;
}

interface AttachmentListProps {
    attachmentFiles: AttachmentFile[];
    onToggleExpand: () => void;
    isExpanded: boolean;
}

// Utility function
const truncateFileName = (fileName: string, maxLength: number) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.substring(fileName.lastIndexOf("."));
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(
        0,
        maxLength - extension.length - 3
    );
    return `${truncatedName}...${extension}`;
};

export default function AttachmentList({
    attachmentFiles,
}: AttachmentListProps) {
    const { download, isDownloading } = useSignedDownload();

    if (!attachmentFiles || attachmentFiles.length === 0) {
        return null;
    }

    // แสดงเฉพาะรายการไฟล์ ไม่แสดงหัวข้อซ้ำ (หัวข้อแสดงที่ปุ่มใน FileItem แล้ว)
    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachmentFiles.map((attachment) => (
                    <div
                        key={attachment.id}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border"
                    >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                                {attachment.mimeType?.includes("image") ? (
                                    <svg
                                        className="w-4 h-4 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                ) : attachment.mimeType?.includes("pdf") ? (
                                    <svg
                                        className="w-4 h-4 text-red-500"
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
                                ) : (
                                    <svg
                                        className="w-4 h-4 text-blue-500"
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
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div
                                    className="text-sm font-medium text-gray-900 dark:text-white truncate"
                                    title={attachment.fileName}
                                >
                                    {truncateFileName(attachment.fileName, 25)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {attachment.fileSize > 0
                                        ? (
                                              attachment.fileSize /
                                              1024 /
                                              1024
                                          ).toFixed(2) + " MB"
                                        : "ไม่ทราบขนาด"}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() =>
                                download({
                                    fileId: attachment.id,
                                    type: "attachment",
                                })
                            }
                            disabled={isDownloading}
                            className="flex-shrink-0 ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors duration-200 disabled:opacity-50"
                            title="ดาวน์โหลด"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
