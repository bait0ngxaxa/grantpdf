import React from "react";
import { Button } from "@/components/ui";
import { ChartBarBig, LogOut, Menu } from "lucide-react";

interface AdminTopBarProps {
    setIsSidebarOpen: (open: boolean) => void;
    activeTab: string;
    signOut: () => void;
}

const menuItems = [
    { id: "dashboard", name: "ภาพรวมระบบ" },
    { id: "documents", name: "จัดการโครงการและเอกสาร" },
    { id: "users", name: "จัดการผู้ใช้งาน" },
];

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
    setIsSidebarOpen,
    activeTab,
    signOut,
}): React.JSX.Element => {
    return (
        <div className="bg-white/70 backdrop-blur-md sticky top-0 z-30 px-6 py-4 border-b border-slate-200/60 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <ChartBarBig className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {menuItems.find((item) => item.id === activeTab)
                            ?.name || "Admin Dashboard"}
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOut()}
                        className="cursor-pointer text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        ออกจากระบบ
                    </Button>
                </div>
            </div>
        </div>
    );
};
