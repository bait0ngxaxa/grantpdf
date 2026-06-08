"use client";

import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { ChevronLeft, UploadCloud, FileText } from "lucide-react";
import { FILE_UPLOAD, ROUTES } from "@/lib/constants";

const ACCEPTED_FILE_TYPES_LABEL = FILE_UPLOAD.ALLOWED_EXTENSIONS.join(", ");

interface UploadHeaderProps {
    onBack?: () => void;
    title?: string;
    subtitle?: string;
}

export const UploadHeader = ({
    onBack,
}: UploadHeaderProps): React.JSX.Element => {
    const router = useRouter();

    const handleBack = (): void => {
        if (onBack) {
            onBack();
        } else {
            router.push(ROUTES.DASHBOARD);
        }
    };

    return (
        <div className="border-b border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 py-5 md:flex-row md:items-center sm:py-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-400">
                            <UploadCloud className="h-7 w-7" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-gray-900 text-balance dark:text-slate-100">
                                อัพโหลดเอกสาร
                                <span className="text-sm font-normal text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-600">
                                    Upload Documents
                                </span>
                            </h1>
                            <p className="mt-1 flex items-start gap-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
                                <FileText className="mt-1 h-4 w-4 shrink-0" />
                                อัพโหลดไฟล์เอกสาร {ACCEPTED_FILE_TYPES_LABEL}
                                เพื่อแนบในโครงการ
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Button
                            onClick={handleBack}
                            variant="ghost"
                            className="h-11 cursor-pointer gap-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            กลับไปยังแดชบอร์ด
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
