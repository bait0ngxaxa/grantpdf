import React from "react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
    isSuccessModalOpen: boolean;
    setIsSuccessModalOpen: (open: boolean) => void;
    successMessage: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    successMessage,
}) => {
    const isError = successMessage.includes("ข้อผิดพลาด");

    return (
        <>
            {isSuccessModalOpen && (
                <dialog className="modal modal-open backdrop-blur-md bg-slate-900/30">
                    <div className="modal-box bg-white p-8 max-w-sm rounded-[2rem] shadow-2xl border border-white/50">
                        <div className="flex flex-col items-center text-center">
                            <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                                    isError
                                        ? "bg-red-50 text-red-500 shadow-red-100"
                                        : "bg-green-50 text-green-500 shadow-green-100"
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
                            <h3
                                className={`font-bold text-2xl mb-3 ${
                                    isError ? "text-red-600" : "text-slate-800"
                                }`}
                            >
                                {isError ? "เกิดข้อผิดพลาด!" : "สำเร็จ!"}
                            </h3>
                            <p className="text-slate-500 mb-8 text-base">
                                {successMessage}
                            </p>
                            <Button
                                onClick={() => setIsSuccessModalOpen(false)}
                                className={`w-full h-12 rounded-2xl text-lg font-medium shadow-lg transition-all transform active:scale-95 ${
                                    isError
                                        ? "bg-red-500 hover:bg-red-600 shadow-red-200 text-white"
                                        : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-200 text-white"
                                }`}
                            >
                                ตกลง
                            </Button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className="cursor-default"
                        >
                            ปิด
                        </button>
                    </form>
                </dialog>
            )}
        </>
    );
};
