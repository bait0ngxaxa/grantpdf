import { type ChangeEvent, type DragEvent } from "react";
import { Button } from "@/components/ui";
import {
    UploadCloud,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-green-600 dark:text-green-400" />
                    อัปโหลดไฟล์เอกสาร
                </h3>

                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        selectedFile
                            ? "border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20"
                            : "border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
                    {selectedFile ? (
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-green-100 dark:border-green-900">
                                <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 break-all px-4">
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
                        <div className="space-y-4 py-4">
                            <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                                <UploadCloud className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100">
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

                    {!selectedFile && (
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="mt-6 cursor-pointer hover:bg-white dark:hover:bg-slate-700"
                            disabled={isUploading}
                        >
                            เลือกไฟล์จากเครื่อง
                        </Button>
                    )}
                </div>
            </div>

            {/* Action Button */}
            {selectedFile && hasSelectedProject && (
                <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Button
                        onClick={onUpload}
                        disabled={isUploading}
                        className="px-8 py-2 cursor-pointer w-full sm:w-auto min-w-[200px]"
                        size="lg"
                    >
                        {isUploading ? (
                            <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                กำลังอัพโหลด...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-4 h-4 mr-2" />
                                อัพโหลดไฟล์ทันที
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Warning when file selected but no project */}
            {selectedFile && !hasSelectedProject && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900/50 rounded-lg flex items-center gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                    <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                        กรุณาเลือกโครงการทางด้านซ้ายก่อนอัพโหลดไฟล์
                    </p>
                </div>
            )}

            {/* Status Message */}
            {uploadMessage && (
                <div
                    className={`p-4 rounded-lg flex items-start gap-3 animate-in fade-in ${
                        uploadSuccess
                            ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-400"
                            : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-400"
                    }`}
                >
                    {uploadSuccess ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">{uploadMessage}</p>
                </div>
            )}
        </div>
    );
}
