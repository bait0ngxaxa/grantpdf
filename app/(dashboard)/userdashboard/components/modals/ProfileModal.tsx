import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { Session } from "next-auth";

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
    return (
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-[450px] rounded-3xl p-0 bg-white border-0 shadow-2xl overflow-hidden"
            >
                {/* Custom Close Button */}
                <DialogClose className="absolute right-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all z-50 focus:outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>

                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-cyan-500 z-0"></div>
                <div className="absolute top-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl z-0"></div>

                {/* Content */}
                <div className="relative z-10 px-6 pb-8 pt-12">
                    {/* Header with User Avatar */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl ring-4 ring-white/50 z-20">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                                {session?.user?.name?.charAt(0).toUpperCase() ||
                                    session?.user?.email
                                        ?.charAt(0)
                                        .toUpperCase() ||
                                    "U"}
                            </div>
                        </div>
                        <DialogTitle className="font-bold text-2xl text-slate-800 mb-1">
                            ข้อมูลส่วนตัว
                        </DialogTitle>
                        <p className="text-sm text-slate-500">
                            ข้อมูลบัญชีผู้ใช้งานของคุณ
                        </p>
                    </div>

                    {/* User Information Cards */}
                    <div className="space-y-4">
                        {/* Name Card */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    ชื่อผู้ใช้
                                </p>
                                <p className="font-bold text-slate-800">
                                    {session?.user?.name || "ไม่ได้ระบุ"}
                                </p>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    อีเมล
                                </p>
                                <p
                                    className="font-bold text-slate-800 truncate"
                                    title={session?.user?.email || ""}
                                >
                                    {session?.user?.email || "ไม่ได้ระบุ"}
                                </p>
                            </div>
                        </div>

                        {/* Role Card */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m5.586-5 1.586-1.586a2 2 0 112.828 2.828L11.414 20H6v-5.414z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    สถานะ
                                </p>
                                <div className="mt-1">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                            session?.user?.role === "admin"
                                                ? "bg-red-50 text-red-600 border-red-100"
                                                : "bg-blue-50 text-blue-600 border-blue-100"
                                        }`}
                                    >
                                        {session?.user?.role === "admin"
                                            ? "ผู้ดูแลระบบ"
                                            : "สมาชิกทั่วไป"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
