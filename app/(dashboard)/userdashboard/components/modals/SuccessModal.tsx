import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SuccessModalProps {
    showSuccessModal: boolean;
    setShowSuccessModal: (show: boolean) => void;
    successMessage: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    showSuccessModal,
    setShowSuccessModal,
    successMessage,
}) => {
    const isError = successMessage.includes("ข้อผิดพลาด");

    return (
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
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
                        {successMessage}
                    </p>
                    <Button
                        onClick={() => setShowSuccessModal(false)}
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
