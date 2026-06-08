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
    submittingLabel = "กำลังสร้างเอกสาร…",
    disabled = false,
}: FormActionsProps): React.JSX.Element {
    return (
        <div className="mt-8 flex justify-center border-t border-slate-200/60 pt-8 dark:border-slate-700/60">
            <Button
                type="button"
                onClick={onPreview}
                className="h-11 w-full cursor-pointer rounded-xl bg-blue-600 px-8 font-bold text-white shadow-md shadow-blue-200 transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:transform-none dark:shadow-blue-900/30 dark:hover:shadow-blue-900/50 sm:w-auto sm:min-w-[300px]"
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
