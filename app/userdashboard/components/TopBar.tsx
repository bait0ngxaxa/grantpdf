import React from 'react';
import { Button } from "@/components/ui/button";

interface TopBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: string;
  session: any;
  router: any;
  signOut: () => void;
}

const menuItems = [
  { id: "dashboard", name: "ภาพรวม" },
  { id: "projects", name: "โครงการของฉัน" },
  { id: "create-project", name: "สร้างโครงการ" },
];

export const TopBar: React.FC<TopBarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  session,
  router,
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {menuItems.find((item) => item.id === activeTab)?.name ||
              "Dashboard"}
          </h1>
        </div>
        <div className=" flex gap-3 sm:flex md:gap-1 items-center space-x-4">
          <span className="text-m text-gray-600 dark:text-gray-400">
            {session?.user?.name} ({session?.user?.role || "member"})
          </span>
          {session?.user?.role === "admin" && (
            <Button
              className="font-semibold cursor-pointer transform hover:scale-105 transition-transform duration-300"
              onClick={() => router.push("/admin")}
            >
              ระบบแอดมิน
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transform hover:scale-105 transition-transform duration-300"
            onClick={() => signOut()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </div>
  );
};