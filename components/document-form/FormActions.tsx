import { Button } from "@/components/ui/button";
import { Eye, FileText, Loader2 } from "lucide-react";

interface FormActionsProps {
    onPreview: () => void;
    isSubmitting: boolean;
    submitLabel?: string;
    submittingLabel?: string;
    disabled?: boolean;
}

export function FormActions({
    onPreview,
    isSubmitting,
    submitLabel = "ยืนยันสร้างเอกสาร",
    submittingLabel = "กำลังสร้างเอกสาร...",
    disabled = false,
}: FormActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-200/60 mt-8">
            <Button
                type="button"
                onClick={onPreview}
                className="cursor-pointer flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                disabled={isSubmitting || disabled}
            >
                <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-white text-slate-500 group-hover:text-blue-600 transition-colors mr-3 border border-slate-200">
                    <Eye className="w-4 h-4" />
                </div>
                ดูตัวอย่างข้อมูล
            </Button>
            <Button
                type="submit"
                className="cursor-pointer flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSubmitting || disabled}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        {submittingLabel}
                    </>
                ) : (
                    <>
                        <FileText className="w-5 h-5 mr-3" />
                        {submitLabel}
                    </>
                )}
            </Button>
        </div>
    );
}
