"use client";

import { useSignedDownload } from "@/lib/hooks/useSignedDownload";
import type { AttachmentFile } from "@/type";
import { Image as ImageIcon, File, FileText, Download } from "lucide-react";
import { truncateFileName } from "@/lib/utils";

interface AttachmentListProps {
    attachmentFiles: AttachmentFile[];
    onToggleExpand?: () => void;
    isExpanded?: boolean;
}

export function AttachmentList({
    attachmentFiles,
}: AttachmentListProps): React.JSX.Element | null {
    const { download, isDownloading } = useSignedDownload();

    if (!attachmentFiles || attachmentFiles.length === 0) {
        return null;
    }

    const getAttachmentIcon = (mimeType: string | null): React.JSX.Element => {
        if (mimeType?.includes("image")) {
            return <ImageIcon className="w-4 h-4 text-green-500" />;
        } else if (mimeType?.includes("pdf")) {
            return <File className="w-4 h-4 text-red-500" />;
        }
        return <FileText className="w-4 h-4 text-blue-500" />;
    };

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
                                {getAttachmentIcon(attachment.mimeType)}
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
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
