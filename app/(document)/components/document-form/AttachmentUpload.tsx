"use client";

import { type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Upload } from "lucide-react";

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
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900/60">
                    <Upload className="size-5" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 text-balance dark:text-slate-100">
                        อัปโหลดไฟล์แนบ
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        เลือกไฟล์ที่ต้องแนบไปกับหนังสืออนุมัติ รองรับ PDF และ Word
                    </p>
                </div>
            </div>
            <div className="space-y-4">
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <Input
                        type="file"
                        multiple
                        className="cursor-pointer rounded-lg border-slate-200 bg-white text-slate-700 transition-colors file:mr-4 file:rounded-md file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-700 hover:file:bg-orange-100 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:file:bg-orange-950/50 dark:file:text-orange-300 dark:hover:file:bg-orange-950"
                        onChange={onFilesChange}
                        accept={accept}
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        สามารถเลือกหลายไฟล์พร้อมกันได้
                    </p>
                </div>

                {/* รายการไฟล์ที่เลือก */}
                {files.length > 0 && (
                    <div className="mt-4">
                        <h5 className="mb-2 text-sm font-semibold text-slate-800 text-balance dark:text-slate-200">
                            ไฟล์ที่เลือก ({files.length} ไฟล์):
                        </h5>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <FileText className="size-4 shrink-0 text-slate-500 dark:text-slate-400" />
                                        <span className="min-w-0 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                            {file.name}
                                        </span>
                                        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                                            (
                                            {(file.size / 1024 / 1024).toFixed(
                                                2,
                                            )}{" "}
                                            MB)
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveFile(index)}
                                        className="h-9 cursor-pointer rounded-lg px-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                    >
                                        <Trash2 className="size-4" />
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
