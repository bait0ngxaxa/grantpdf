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
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-orange-600" />
                อัปโหลดไฟล์แนบ
            </h4>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        เลือกไฟล์แนบ (สามารถเลือกหลายไฟล์)
                    </label>
                    <Input
                        type="file"
                        multiple
                        className={`border border-slate-300 rounded-lg 
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            transition-colors file:mr-4 file:py-2 file:px-4 
                            file:rounded-md file:border-0 file:text-sm 
                            file:font-medium file:bg-orange-50 file:text-orange-700 
                            hover:file:bg-orange-100`}
                        onChange={onFilesChange}
                        accept={accept}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        รองรับไฟล์: PDF, Word
                    </p>
                </div>

                {/* รายการไฟล์ที่เลือก */}
                {files.length > 0 && (
                    <div className="mt-4">
                        <h5 className="text-sm font-medium text-slate-700 mb-2">
                            ไฟล์ที่เลือก ({files.length} ไฟล์):
                        </h5>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200"
                                >
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-700">
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            (
                                            {(file.size / 1024 / 1024).toFixed(
                                                2
                                            )}{" "}
                                            MB)
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onRemoveFile(index)}
                                        className="px-2 py-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
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
