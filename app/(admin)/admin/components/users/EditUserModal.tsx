import React, { type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, Loader2, X } from "lucide-react";
import { ROLES, type UserRole } from "@/lib/shared/constants";
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
    const [displayedUser, setDisplayedUser] = React.useState(user);
    const handleClose = React.useCallback((): void => {
        if (isSaving) return;
        onClose();
    }, [isSaving, onClose]);

    const handleOpenAutoFocus = React.useCallback((_event: Event): void => {
        if (user) {
            setDisplayedUser(user);
        }
    }, [user]);

    const renderedUser = user ?? displayedUser;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
        >
            {renderedUser && (
                <DialogContent
                    showCloseButton={false}
                    onOpenAutoFocus={handleOpenAutoFocus}
                    className="max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-md gap-0 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_14px_rgba(15,23,42,0.12)] sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-md sm:p-8 dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_8px_14px_rgba(0,0,0,0.32)]"
                >
                    <DialogClose asChild>
                        <button
                            type="button"
                            aria-label="ปิดหน้าต่างแก้ไขผู้ใช้งาน"
                            disabled={isSaving}
                            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </DialogClose>
                <div className="mb-6">
                    <DialogTitle
                        className="break-words text-xl font-bold text-slate-800 text-balance dark:text-slate-100"
                    >
                        แก้ไขผู้ใช้งาน
                    </DialogTitle>
                    <DialogDescription className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                        อัปเดตข้อมูลของ {renderedUser.name}
                    </DialogDescription>
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
                            disabled={isSaving}
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
                                disabled={isSaving}
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
                            onClick={handleClose}
                            disabled={isSaving}
                            className="px-6 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving || !canSave}
                            className="rounded-xl bg-blue-600 px-6 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
                                    กำลังบันทึก…
                                </>
                            ) : (
                                "บันทึกการแก้ไข"
                            )}
                        </Button>
                    </div>
                </form>
                </DialogContent>
            )}
        </Dialog>
    );
};
