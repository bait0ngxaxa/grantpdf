import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { X, User, Mail, BadgeCheck } from "lucide-react";
import { cn, getAvatarInitial } from "@/lib/utils";
import type { Session } from "@/lib/authTypes";
import { ROLES } from "@/lib/constants";
import { DeviceSessionsPanel } from "./DeviceSessionsPanel";

interface ProfileModalProps {
    showProfileModal: boolean;
    setShowProfileModal: (show: boolean) => void;
    session: Session | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
    showProfileModal,
    setShowProfileModal,
    session,
}) => {
    const avatarInitial = getAvatarInitial(
        session?.user?.name,
        session?.user?.email,
        "U",
    );

    return (
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
            <DialogContent
                showCloseButton={false}
                className="max-h-[calc(100dvh-1rem)] overflow-hidden rounded-xl border border-slate-100 bg-white p-0 shadow-xl sm:max-w-[920px] sm:rounded-2xl dark:border-slate-700 dark:bg-slate-800"
            >
                {/* Custom Close Button */}
                <DialogClose className="absolute right-3 top-3 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:right-4 sm:top-4 sm:h-9 sm:w-9 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                    <X className="h-4 w-4" />
                    <span className="sr-only">ปิด</span>
                </DialogClose>

                <div className="absolute left-0 top-0 z-0 h-full w-full bg-slate-50 dark:bg-slate-900" />

                {/* Content */}
                <div className="relative z-10 max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain p-3 pt-14 sm:max-h-[calc(100dvh-2rem)] sm:p-6">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)] lg:items-start">
                        <section className="rounded-xl border border-white/70 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5 dark:border-slate-700 dark:bg-slate-800">
                            <div className="mb-5 flex flex-col items-center text-center sm:mb-6">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-4 ring-white/60 sm:h-24 sm:w-24">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-blue-600 sm:h-20 sm:w-20 sm:text-3xl dark:bg-slate-700 dark:text-blue-400">
                                        {avatarInitial}
                                    </div>
                                </div>
                                <DialogTitle className="mb-1 text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">
                                    ข้อมูลส่วนตัว
                                </DialogTitle>
                                <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                                    ข้อมูลบัญชีผู้ใช้งานของคุณ
                                </DialogDescription>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:gap-4 sm:rounded-2xl sm:p-4 dark:border-slate-600 dark:bg-slate-700/50">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm dark:bg-slate-600 dark:text-blue-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            ชื่อผู้ใช้
                                        </p>
                                        <p className="truncate font-bold text-slate-800 dark:text-slate-100">
                                            {session?.user?.name || "ไม่ได้ระบุ"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:gap-4 sm:rounded-2xl sm:p-4 dark:border-slate-600 dark:bg-slate-700/50">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-green-500 shadow-sm dark:bg-slate-600 dark:text-green-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            อีเมล
                                        </p>
                                        <p
                                            className="truncate font-bold text-slate-800 dark:text-slate-100"
                                            title={session?.user?.email || ""}
                                        >
                                            {session?.user?.email || "ไม่ได้ระบุ"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:gap-4 sm:rounded-2xl sm:p-4 dark:border-slate-600 dark:bg-slate-700/50">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-500 shadow-sm dark:bg-slate-600 dark:text-purple-400">
                                        <BadgeCheck className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            สถานะ
                                        </p>
                                        <div className="mt-1">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
                                                    session?.user?.role === ROLES.ADMIN
                                                        ? "border-red-100 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                        : "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                                                )}
                                            >
                                                {session?.user?.role === ROLES.ADMIN
                                                    ? "ผู้ดูแลระบบ"
                                                    : "สมาชิกทั่วไป"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <DeviceSessionsPanel />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
