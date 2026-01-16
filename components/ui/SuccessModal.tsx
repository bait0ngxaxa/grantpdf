import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
            <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white border-0 shadow-2xl">
                <div className="flex flex-col items-center text-center p-4">
                    <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                            isError
                                ? "bg-red-50 text-red-500 ring-4 ring-red-50"
                                : "bg-green-50 text-green-500 ring-4 ring-green-50"
                        }`}
                    >
                        {isError ? (
                            <X className="h-10 w-10" strokeWidth={2.5} />
                        ) : (
                            <Check className="h-10 w-10" strokeWidth={2.5} />
                        )}
                    </div>
                    <DialogTitle
                        className={`font-bold text-2xl mb-3 text-center ${
                            isError ? "text-slate-800" : "text-slate-800"
                        }`}
                    >
                        {isError ? "เกิดข้อผิดพลาด" : "ดำเนินการสำเร็จ"}
                    </DialogTitle>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {message}
                    </p>
                    <Button
                        onClick={onClose}
                        className={`w-full rounded-xl h-12 text-lg font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
                            isError
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-200"
                                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-blue-200"
                        }`}
                    >
                        ตกลง
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
