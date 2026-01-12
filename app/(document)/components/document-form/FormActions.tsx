import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

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
    submitLabel = "สร้างเอกสาร",
    submittingLabel = "กำลังสร้างเอกสาร...",
    disabled = false,
}: FormActionsProps) {
    return (
        <div className="flex justify-center pt-8 border-t border-slate-200/60 mt-8">
            <Button
                type="button"
                onClick={onPreview}
                className="cursor-pointer w-full sm:w-auto sm:min-w-[300px] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
