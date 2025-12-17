import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
            <DialogContent className="w-11/12 max-w-lg mx-auto bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>

                {/* Content */}
                <div className="relative z-10 p-2">
                    {/* Header with User Avatar */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900">
                            <span className="text-white text-2xl font-bold">
                                {session?.user?.name?.charAt(0).toUpperCase() ||
                                    session?.user?.email
                                        ?.charAt(0)
                                        .toUpperCase() ||
                                    "U"}
                            </span>
                        </div>
                        <DialogTitle className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            ข้อมูลส่วนตัว
                        </DialogTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            รายละเอียดบัญชีผู้ใช้งาน
                        </p>
                    </div>

                    {/* User Information Cards */}
                    <div className="space-y-4 mb-6">
                        {/* Name Card */}
                        <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-blue-600 dark:text-blue-400"
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
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        ชื่อผู้ใช้
                                    </div>
                                    <div className="font-bold text-lg text-gray-800 dark:text-white">
                                        {session?.user?.name || "ไม่ได้ระบุ"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-green-600 dark:text-green-400"
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
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        อีเมล
                                    </div>
                                    <div className="font-bold text-lg text-gray-800 dark:text-white truncate">
                                        {session?.user?.email || "ไม่ได้ระบุ"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role Card */}
                        <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-purple-600 dark:text-purple-400"
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
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        สถานะผู้ใช้
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <span
                                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 shadow-md ${
                                                session?.user?.role === "admin"
                                                    ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                                                    : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                                            }`}
                                        >
                                            {session?.user?.role ===
                                                "admin" && (
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 12l2 2 4-4m5.586-5 1.586-1.586a2 2 0 112.828 2.828L11.414 20H6v-5.414z"
                                                    />
                                                </svg>
                                            )}
                                            {session?.user?.role !==
                                                "admin" && (
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                            )}
                                            {session?.user?.role === "admin"
                                                ? "ผู้ดูแลระบบ"
                                                : "สมาชิกทั่วไป"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600"></div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
