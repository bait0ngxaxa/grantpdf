import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    maxWidth?: string;
    errorMessage?: string | null;
}

export function PreviewModal({
    isOpen,
    onClose,
    onConfirm,
    title = "ตัวอย่างข้อมูลที่จะสร้างเอกสาร",
    description = "กรุณาตรวจสอบข้อมูลของคุณก่อนสร้างเอกสาร",
    children,
    confirmLabel = "ยืนยันและสร้างเอกสาร",
    cancelLabel = "แก้ไข",
    maxWidth = "!max-w-[min(1120px,calc(100vw-2rem))] sm:!max-w-[min(1120px,calc(100vw-2rem))]",
    errorMessage,
}: PreviewModalProps): React.JSX.Element {
    const hasError = Boolean(errorMessage);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={cn(
                    maxWidth,
                    "flex h-[min(88dvh,900px)] w-[calc(100vw-1rem)] flex-col overflow-hidden border border-slate-200 bg-white p-0 sm:w-[calc(100vw-2rem)] dark:border-slate-700 dark:bg-slate-900",
                )}
            >
                <DialogHeader className="flex-shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5 dark:border-slate-700">
                    <DialogTitle className="text-slate-900 dark:text-slate-100">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-300">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                {/* Error Alert */}
                {hasError && (
                    <div className="mx-4 mt-4 flex flex-shrink-0 items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:mx-6 dark:border-red-900/50 dark:bg-red-900/20">
                        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-700 dark:text-red-300">
                            <p className="font-medium">
                                กรุณาแก้ไขข้อมูลก่อนสร้างเอกสาร
                            </p>
                            <p className="mt-1">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Scrollable content area with word break */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                    <div className="mx-auto w-full max-w-5xl space-y-4 break-words">
                        {children}
                    </div>
                </div>

                {/* Sticky footer */}
                <DialogFooter className="flex-shrink-0 border-t border-slate-200 px-4 py-4 sm:px-6 dark:border-slate-700">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            className="cursor-pointer rounded-lg"
                        >
                            {cancelLabel}
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={onConfirm}
                        disabled={hasError}
                        className="cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
