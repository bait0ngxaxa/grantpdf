"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ForgotPasswordSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    email?: string;
}

export const ForgotPasswordSuccessModal: React.FC<
    ForgotPasswordSuccessModalProps
> = ({ isOpen, onClose, email }) => {
    const router = useRouter();

    const handleGoToSignin = () => {
        onClose();
        router.push("/signin");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-800 max-w-md w-full mx-4 rounded-lg shadow-xl transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95 p-6">
                <div className="flex flex-col items-center text-center">
                    {/* Success Icon */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100 dark:bg-green-900/20">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    {/* Success Message */}
                    <h3 className="font-bold text-lg mb-2 text-green-600">
                        ส่งคำขอสำเร็จ!
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        ได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว
                    </p>
                    {email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {email}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                        กรุณาตรวจสอบอีเมลของคุณเพื่อดำเนินการต่อ
                    </p>

                    {/* Action Button */}
                    <div className="flex flex-col space-y-2 w-full">
                        <Button
                            onClick={handleGoToSignin}
                            className="w-full bg-primary hover:bg-primary/90 text-white transform transition-all duration-200 hover:scale-105"
                        >
                            ไปยังหน้าเข้าสู่ระบบ
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
