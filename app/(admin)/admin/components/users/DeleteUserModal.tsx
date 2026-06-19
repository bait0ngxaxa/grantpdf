import React from "react";
import { Button } from "@/components/ui";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import type { UserApiData } from "@/type";

type UserData = UserApiData;

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
    React.useEffect(() => {
        if (!isOpen || isDeleting) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isDeleting, isOpen, onClose]);

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <button
                type="button"
                aria-label="ปิดหน้าต่างยืนยันการลบผู้ใช้งาน"
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={isDeleting ? undefined : onClose}
                disabled={isDeleting}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-user-modal-title"
                className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xl animate-in zoom-in-95 duration-200 sm:p-8 dark:border-slate-700 dark:bg-slate-800"
            >
                <button
                    type="button"
                    aria-label="ปิดหน้าต่างยืนยันการลบผู้ใช้งาน"
                    onClick={onClose}
                    disabled={isDeleting}
                    className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="flex flex-col items-center justify-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Trash2 className="h-8 w-8" />
                    </div>
                    <h3
                        id="delete-user-modal-title"
                        className="text-xl font-bold text-slate-800 dark:text-slate-100 text-balance"
                    >
                        ยืนยันการลบผู้ใช้งาน
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน <br />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                            &quot;{user.name}&quot;
                        </span>{" "}
                        ({user.email})?
                    </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-400 text-balance">
                                คำเตือน
                            </h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-400/80">
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
                        className="px-6 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 font-medium transition"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังลบ…
                            </>
                        ) : (
                            "ยืนยันการลบ"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
