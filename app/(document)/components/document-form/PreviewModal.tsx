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
    maxWidth = "max-w-2xl",
    errorMessage,
}: PreviewModalProps): React.JSX.Element {
    const hasError = Boolean(errorMessage);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={`${maxWidth} max-h-[85vh] flex flex-col`}>
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {/* Error Alert */}
                {hasError && (
                    <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-700">
                            <p className="font-medium">
                                กรุณาแก้ไขข้อมูลก่อนสร้างเอกสาร
                            </p>
                            <p className="mt-1">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Scrollable content area with word break */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
                    <div className="break-words overflow-hidden">
                        {children}
                    </div>
                </div>

                {/* Sticky footer */}
                <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
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
