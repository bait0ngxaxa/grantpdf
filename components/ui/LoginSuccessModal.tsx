"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface LoginSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    email?: string;
    autoCloseDelay?: number;
}

export const LoginSuccessModal: React.FC<LoginSuccessModalProps> = ({
    isOpen,
    onClose,
    email,
    autoCloseDelay = 3000,
}) => {
    const router = useRouter();

    const handleGoToDashboard = () => {
        onClose();
        router.push("/userdashboard");
    };

    // Auto-close modal
    useEffect(() => {
        if (isOpen && autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                handleGoToDashboard();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, autoCloseDelay]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white border-0 shadow-2xl focus:outline-none">
                <div className="flex flex-col items-center text-center p-4">
                    {/* Success Icon */}
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg bg-green-50 text-green-500 ring-4 ring-green-50">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 animate-[bounce_1s_infinite]"
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
                    </div>

                    <DialogTitle className="font-bold text-2xl mb-3 text-center text-slate-800">
                        เข้าสู่ระบบสำเร็จ!
                    </DialogTitle>

                    <div className="text-slate-500 mb-8 leading-relaxed space-y-1">
                        <p>ยินดีต้อนรับเข้าสู่ระบบ</p>
                        {email && (
                            <p className="font-medium text-slate-700">
                                {email}
                            </p>
                        )}
                        <p className="text-xs text-slate-400 mt-4 pt-4">
                            กำลังนำทางไปยังหน้าหลักอัตโนมัติ...
                        </p>
                    </div>

                    <Button
                        onClick={handleGoToDashboard}
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-200 h-12 text-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        ไปยังหน้าหลัก
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
