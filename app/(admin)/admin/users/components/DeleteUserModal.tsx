import React from "react";
import { Button } from "@/components/ui";
import { Trash2, AlertTriangle } from "lucide-react";

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
                        <Trash2 className="h-8 w-8" />
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
                            <AlertTriangle className="h-5 w-5 text-red-400" />
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
