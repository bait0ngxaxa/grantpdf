import { type ChangeEvent, type DragEvent } from "react";
import { Button } from "@/components/ui";
import {
    UploadCloud,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadAreaProps {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    selectedFile: File | null;
    isUploading: boolean;
    uploadMessage: string;
    uploadSuccess: boolean;
    hasSelectedProject: boolean;
    onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
    onDragOver: (event: DragEvent<HTMLDivElement>) => void;
    onDrop: (event: DragEvent<HTMLDivElement>) => void;
    onUpload: () => void;
    onClearFile?: () => void;
}

export function UploadArea({
    fileInputRef,
    selectedFile,
    isUploading,
    uploadMessage,
    uploadSuccess,
    hasSelectedProject,
    onFileSelect,
    onDragOver,
    onDrop,
    onUpload,
    onClearFile,
}: UploadAreaProps): React.JSX.Element {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 text-balance dark:text-slate-100">
                    <UploadCloud className="w-5 h-5 text-green-600 dark:text-green-400" />
                    อัปโหลดไฟล์เอกสาร
                </h3>

                <div
                    className={cn(
                        "relative min-h-[24rem] rounded-2xl border-2 border-dashed p-8 text-center transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200 sm:p-10 lg:min-h-[28rem]",
                        selectedFile
                            ? "border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20"
                            : "border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800",
                    )}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
                    {selectedFile ? (
                        <div className="flex min-h-[18rem] flex-col items-center justify-center space-y-4">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-green-100 bg-white shadow-sm dark:border-green-900 dark:bg-slate-800">
                                <FileText className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 break-all px-4 text-balance">
                                    {selectedFile.name}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                    ขนาด: {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                            {onClearFile && !isUploading && (
                                <button
                                    onClick={onClearFile}
                                    className="absolute top-4 right-4 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex min-h-[18rem] flex-col items-center justify-center space-y-4 py-4">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/50">
                                <UploadCloud className="h-10 w-10 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 text-balance">
                                    ลากไฟล์มาวางที่นี่
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                                    หรือคลิกปุ่มด้านล่างเพื่อเลือกไฟล์
                                </p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                                    รองรับไฟล์ .docx และ .pdf (สูงสุด 10MB)
                                </p>
                            </div>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx,.pdf"
                        onChange={onFileSelect}
                        className="hidden"
                        disabled={isUploading}
                    />

                    {!selectedFile ? (
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="mt-6 cursor-pointer hover:bg-white dark:hover:bg-slate-700"
                            disabled={isUploading}
                        >
                            เลือกไฟล์จากเครื่อง
                        </Button>
                    ) : hasSelectedProject ? (
                        <Button
                            onClick={onUpload}
                            disabled={isUploading}
                            className="mt-6 min-w-[200px] cursor-pointer px-8 py-2"
                            size="lg"
                        >
                            {isUploading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    กำลังอัพโหลด…
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    อัพโหลดไฟล์ทันที
                                </>
                            )}
                        </Button>
                    ) : null}

                    {uploadMessage && (
                        <div
                            className={cn(
                                "mx-auto mt-5 flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-left animate-in fade-in",
                                uploadSuccess
                                    ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/30 dark:text-green-400"
                                    : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400",
                            )}
                        >
                            {uploadSuccess ? (
                                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                            )}
                            <p className="text-sm font-semibold leading-6">
                                {uploadMessage}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Warning when file selected but no project */}
            {selectedFile && !hasSelectedProject && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900/50 rounded-lg flex items-center gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                    <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                        กรุณาเลือกโครงการทางด้านซ้ายก่อนอัพโหลดไฟล์
                    </p>
                </div>
            )}

        </div>
    );
}

