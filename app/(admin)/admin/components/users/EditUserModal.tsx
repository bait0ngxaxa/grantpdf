import React, { type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { ChevronDown, Loader2, X } from "lucide-react";
import { ROLES, type UserRole } from "@/lib/constants";
import type { UserApiData } from "@/type";

type UserData = UserApiData;
type EditableRole = UserRole | "";

interface EditFormData {
    name: string;
    email: string;
    role: EditableRole;
}

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    editFormData: EditFormData;
    onFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    onSubmit: (e: FormEvent) => void;
    isSaving: boolean;
    canSave: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    user,
    editFormData,
    onFormChange,
    onSubmit,
    isSaving,
    canSave,
}) => {
    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <button
                type="button"
                aria-label="ปิดหน้าต่างแก้ไขผู้ใช้งาน"
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-user-modal-title"
                className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xl animate-in zoom-in-95 duration-200 sm:p-8 dark:border-slate-700 dark:bg-slate-800"
            >
                <button
                    type="button"
                    aria-label="ปิดหน้าต่างแก้ไขผู้ใช้งาน"
                    onClick={onClose}
                    className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="mb-6">
                    <h3
                        id="edit-user-modal-title"
                        className="text-xl font-bold text-slate-800 dark:text-slate-100 text-balance"
                    >
                        แก้ไขผู้ใช้งาน
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        อัปเดตข้อมูลของ {user.name}
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            ชื่อ
                        </label>
                        <Input
                            type="text"
                            name="name"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors font-medium text-slate-900 dark:text-slate-100"
                            value={editFormData.name}
                            onChange={onFormChange}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            อีเมล
                        </label>
                        <div className="relative">
                            <Input
                                type="email"
                                name="email"
                                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                value={editFormData.email}
                                onChange={onFormChange}
                                required
                                disabled
                            />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-1">
                            *อีเมลไม่สามารถแก้ไขได้เพื่อความปลอดภัย
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            บทบาท
                        </label>
                        <div className="relative">
                            <select
                                name="role"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors appearance-none font-medium cursor-pointer"
                                value={editFormData.role}
                                onChange={onFormChange}
                                required
                            >
                                <option value={ROLES.MEMBER}>
                                    สมาชิก (Member)
                                </option>
                                <option value={ROLES.ADMIN}>
                                    ผู้ดูแลระบบ (Admin)
                                </option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 dark:text-slate-400">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="px-6 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving || !canSave}
                            className="px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-200 font-medium transition"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    กำลังบันทึก…
                                </>
                            ) : (
                                "บันทึกการแก้ไข"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
