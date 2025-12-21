import React from "react";
import { Button } from "@/components/ui/button";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: "member" | "admin";
}

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    isDeleting: boolean;
    onConfirm: () => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
    isOpen,
    onClose,
    user,
    isDeleting,
    onConfirm,
}) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-8 border border-slate-100">
                <div className="flex flex-col items-center justify-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">
                        ยืนยันการลบผู้ใช้งาน
                    </h3>
                    <p className="text-slate-500 mt-2">
                        คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน <br />
                        <span className="font-semibold text-slate-800">
                            &quot;{user.name}&quot;
                        </span>{" "}
                        ({user.email})?
                    </p>
                </div>

                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                คำเตือน
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>
                                    การกระทำนี้ไม่สามารถกู้คืนได้
                                    ข้อมูลทั้งหมดของผู้ใช้งานรายนี้จะถูกลบออกจากระบบอย่างถาวร
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center space-x-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-6 rounded-xl hover:bg-slate-100 text-slate-600 font-medium transition-colors"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 font-medium transition-all"
                    >
                        {isDeleting ? "กำลังลบ..." : "ยืนยันการลบ"}
                    </Button>
                </div>
            </div>
            {/* Backdrop click to close */}
            <div className="absolute inset-0 z-[-1]" onClick={onClose} />
        </div>
    );
};
