import React, { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: "member" | "admin";
}

interface EditFormData {
    name: string;
    email: string;
    role: string;
}

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    editFormData: EditFormData;
    onFormChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    onSubmit: (e: FormEvent) => void;
    isSaving: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    user,
    editFormData,
    onFormChange,
    onSubmit,
    isSaving,
}) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-8 border border-slate-100">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800">
                        แก้ไขผู้ใช้งาน
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        อัปเดตข้อมูลของ {user.name}
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            ชื่อ
                        </label>
                        <Input
                            type="text"
                            name="name"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                            value={editFormData.name}
                            onChange={onFormChange}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            อีเมล
                        </label>
                        <div className="relative">
                            <Input
                                type="email"
                                name="email"
                                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                value={editFormData.email}
                                onChange={onFormChange}
                                required
                                disabled
                            />
                        </div>
                        <p className="text-xs text-slate-400 font-medium ml-1">
                            *อีเมลไม่สามารถแก้ไขได้เพื่อความปลอดภัย
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            บทบาท
                        </label>
                        <div className="relative">
                            <select
                                name="role"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none font-medium cursor-pointer"
                                value={editFormData.role}
                                onChange={onFormChange}
                                required
                            >
                                <option value="member">สมาชิก (Member)</option>
                                <option value="admin">
                                    ผู้ดูแลระบบ (Admin)
                                </option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                                <svg
                                    className="h-4 w-4 fill-current"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="px-6 rounded-xl hover:bg-slate-100 text-slate-600 font-medium transition-colors"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-200 font-medium transition-all"
                        >
                            {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                        </Button>
                    </div>
                </form>
            </div>
            {/* Backdrop click to close */}
            <div className="absolute inset-0 z-[-1]" onClick={onClose} />
        </div>
    );
};
