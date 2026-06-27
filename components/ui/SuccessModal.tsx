import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    message,
}) => {
    const isError =
        message.includes("ข้อผิดพลาด") ||
        message.includes("ไม่สำเร็จ") ||
        message.includes("ล้มเหลว") ||
        message.includes("Error");

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-2xl border border-slate-100 bg-white p-4 sm:max-w-md sm:p-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col items-center p-2 text-center sm:p-4">
                    <div
                        className={cn(
                            "mb-6 flex h-20 w-20 items-center justify-center rounded-full ring-4",
                            isError
                                ? "bg-red-50 text-red-500 ring-red-50 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900/30"
                                : "bg-green-50 text-green-500 ring-green-50 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-900/30",
                        )}
                    >
                        {isError ? (
                            <X className="h-10 w-10" strokeWidth={2.5} />
                        ) : (
                            <Check className="h-10 w-10" strokeWidth={2.5} />
                        )}
                    </div>
                    <DialogTitle
                        className={cn(
                            "mb-3 break-words text-center text-2xl font-bold",
                            isError
                                ? "text-slate-800 dark:text-slate-100"
                                : "text-slate-800 dark:text-slate-100",
                        )}
                    >
                        {isError ? "เกิดข้อผิดพลาด" : "ดำเนินการสำเร็จ"}
                    </DialogTitle>
                    <DialogDescription className="mb-8 break-words leading-relaxed text-slate-500 dark:text-slate-400">
                        {message}
                    </DialogDescription>
                    <Button
                        onClick={onClose}
                        className={cn(
                            "h-12 w-full rounded-xl text-lg font-semibold transition-colors",
                            isError
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-blue-600 text-white hover:bg-blue-700",
                        )}
                    >
                        ตกลง
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

