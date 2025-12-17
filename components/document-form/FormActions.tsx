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
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
            <Button
                type="button"
                onClick={onPreview}
                className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || disabled}
            >
                <Eye className="w-5 h-5 mr-2" />
                ดูตัวอย่างข้อมูล
            </Button>
            <Button
                type="submit"
                className="cursor-pointer flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || disabled}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        {submittingLabel}
                    </>
                ) : (
                    <>
                        <FileText className="w-5 h-5 mr-2" />
                        {submitLabel}
                    </>
                )}
            </Button>
        </div>
    );
}
