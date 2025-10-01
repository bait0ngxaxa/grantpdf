import React from 'react';
import { Button } from "@/components/ui/button";
import { ChartBarBig } from 'lucide-react';

interface AdminTopBarProps {
  isSidebarOpen: boolean;
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
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  signOut,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="lg:hidden btn btn-ghost btn-sm"
            onClick={() => setIsSidebarOpen(true)}
          >
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <ChartBarBig/>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {menuItems.find((item) => item.id === activeTab)?.name ||
              "Admin Dashboard"}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="cursor-pointer"
          >
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </div>
  );
};