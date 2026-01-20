"use client";

import { type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";

interface AttachmentUploadProps {
    files: File[];
    onFilesChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: (index: number) => void;
    accept?: string;
}

export function AttachmentUpload({
    files,
    onFilesChange,
    onRemoveFile,
    accept = ".pdf,.doc,.docx",
}: AttachmentUploadProps): React.JSX.Element {
    return (
        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900/50">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                อัปโหลดไฟล์แนบ
            </h4>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        เลือกไฟล์แนบ (สามารถเลือกหลายไฟล์)
                    </label>
                    <Input
                        type="file"
                        multiple
                        className={`border border-slate-300 dark:border-slate-600 rounded-lg 
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            transition-colors file:mr-4 file:py-2 file:px-4 
                            file:rounded-md file:border-0 file:text-sm 
                            file:font-medium file:bg-orange-50 dark:file:bg-orange-900/40 file:text-orange-700 dark:file:text-orange-300
                            hover:file:bg-orange-100 dark:hover:file:bg-orange-900/60
                            text-slate-700 dark:text-slate-300`}
                        onChange={onFilesChange}
                        accept={accept}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        รองรับไฟล์: PDF, Word
                    </p>
                </div>

                {/* รายการไฟล์ที่เลือก */}
                {files.length > 0 && (
                    <div className="mt-4">
                        <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            ไฟล์ที่เลือก ({files.length} ไฟล์):
                        </h5>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                        <span className="text-sm text-slate-700 dark:text-slate-200">
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            (
                                            {(file.size / 1024 / 1024).toFixed(
                                                2,
                                            )}{" "}
                                            MB)
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onRemoveFile(index)}
                                        className="px-2 py-1 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-700"
                                    >
                                        ลบ
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
