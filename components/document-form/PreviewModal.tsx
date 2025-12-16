import { ReactNode } from "react";
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
}: PreviewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={`${maxWidth} max-h-[80vh] overflow-y-auto`}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">{children}</div>

                <DialogFooter>
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
                        className="cursor-pointer rounded-lg"
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
