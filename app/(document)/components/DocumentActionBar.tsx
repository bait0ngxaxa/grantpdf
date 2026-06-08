import { Button } from "@/components/ui/button";
import { ClipboardCheck, Loader2 } from "lucide-react";

interface DocumentActionBarProps {
    onPreview: () => void;
    isSubmitting: boolean;
    disabled?: boolean;
    title?: string;
    description?: string;
    submitLabel?: string;
    submittingLabel?: string;
}

export function DocumentActionBar({
    onPreview,
    isSubmitting,
    disabled = false,
    title = "ตรวจสอบข้อมูลก่อนสร้างเอกสาร",
    description = "ดูตัวอย่างและยืนยันข้อมูลก่อนสร้างไฟล์ Word",
    submitLabel = "ตรวจสอบและสร้างเอกสาร",
    submittingLabel = "กำลังสร้างเอกสาร...",
}: DocumentActionBarProps): React.JSX.Element {
    return (
        <>
            <div className="h-28 sm:h-20" aria-hidden="true" />
            <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-200/70 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-slate-950/50 sm:inset-x-4 sm:bottom-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 px-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:flex sm:shrink-0">
                        <Button
                            type="button"
                            onClick={onPreview}
                            disabled={isSubmitting || disabled}
                            className="h-11 cursor-pointer rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none motion-reduce:transition-none motion-reduce:transform-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    {submittingLabel}
                                </>
                            ) : (
                                <>
                                    <ClipboardCheck className="size-4" />
                                    {submitLabel}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
