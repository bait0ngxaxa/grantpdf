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
        <dialog className="modal modal-open">
            <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
                <h3 className="font-bold text-lg text-red-600 mb-4">
                    ยืนยันการลบผู้ใช้งาน
                </h3>
                <div className="py-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน{" "}
                        <strong className="text-gray-900 dark:text-white">
                            {user.name}
                        </strong>{" "}
                        ({user.email})?
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                        การกระทำนี้ไม่สามารถย้อนกลับได้
                    </p>
                </div>
                <div className="flex justify-end space-x-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="cursor-pointer px-4 py-2"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? "กำลังลบ..." : "ลบ"}
                    </Button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>ปิด</button>
            </form>
        </dialog>
    );
};
