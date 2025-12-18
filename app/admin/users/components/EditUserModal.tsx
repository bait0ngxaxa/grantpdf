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
        <dialog className="modal modal-open">
            <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                    แก้ไขผู้ใช้งาน: {user.name}
                </h3>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ชื่อ
                        </label>
                        <Input
                            type="text"
                            name="name"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            value={editFormData.name}
                            onChange={onFormChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            อีเมล
                        </label>
                        <Input
                            type="email"
                            name="email"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white opacity-50"
                            value={editFormData.email}
                            onChange={onFormChange}
                            required
                            disabled
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            อีเมลไม่สามารถแก้ไขได้
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            บทบาท
                        </label>
                        <select
                            name="role"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            value={editFormData.role}
                            onChange={onFormChange}
                            required
                        >
                            <option value="member">สมาชิก</option>
                            <option value="admin">ผู้ดูแลระบบ</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="px-4 py-2 cursor-pointer"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-primary hover:bg-primary-focus text-white cursor-pointer"
                        >
                            {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>ปิด</button>
            </form>
        </dialog>
    );
};
