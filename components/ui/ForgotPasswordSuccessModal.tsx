"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Dialog, DialogContent, DialogTitle } from "@/components/ui";
import { CheckCircle2 } from "lucide-react";

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white border-0 shadow-2xl focus:outline-none">
                <div className="flex flex-col items-center text-center p-2">
                    {/* Success Icon with Animation */}
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg bg-green-50 text-green-600 ring-4 ring-green-50 animate-in zoom-in-50 duration-300">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <DialogTitle className="font-bold text-2xl mb-3 text-center text-slate-800">
                        ส่งคำขอสำเร็จ!
                    </DialogTitle>

                    <div className="text-slate-500 mb-8 leading-relaxed space-y-2 w-full">
                        <p>ได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว</p>
                        {email && (
                            <p className="font-medium text-slate-700">
                                {email}
                            </p>
                        )}
                        <p className="text-xs text-slate-400 mt-4 pt-4">
                            กรุณาตรวจสอบอีเมลของคุณเพื่อดำเนินการต่อ
                        </p>
                    </div>

                    <Button
                        onClick={handleGoToSignin}
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-200 h-12 text-base font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        ไปยังหน้าเข้าสู่ระบบ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
