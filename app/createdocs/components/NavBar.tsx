"use client";

import { Button } from "@/components/ui/button";

interface NavBarProps {
  selectedCategory: string | null;
  selectedContractType: string | null;
  onBack: () => void;
  onCategorySelect: (category: string | null) => void;
  onContractTypeSelect: (type: string | null) => void;
}

export const NavBar = ({
  selectedCategory,
  selectedContractType,
  onBack,
  onCategorySelect,
  onContractTypeSelect,
}: NavBarProps) => {
  return (
    <div className="navbar bg-base-100 rounded-box shadow-lg mb-6">
      <div className="flex-1">
        <Button
          onClick={onBack}
          className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg transition-colors"
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
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="ml-2">กลับ</span>
        </Button>
      </div>
      <div className="flex-none flex items-center space-x-4">
        {selectedContractType && (
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <button
                  onClick={() => {
                    onCategorySelect(null);
                    onContractTypeSelect(null);
                  }}
                  className="link link-hover"
                >
                  หน้าหลัก
                </button>
              </li>
              <li>
                <button
                  onClick={() => onContractTypeSelect(null)}
                  className="link link-hover"
                >
                  ยื่นโครงการ
                </button>
              </li>
              <li className="text-base-content/60">
                สัญญาจ้างปฏิบัติงานวิชาการ
              </li>
            </ul>
          </div>
        )} 
        {selectedCategory && !selectedContractType && (
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <button
                  onClick={() => onCategorySelect(null)}
                  className="link link-hover"
                >
                  หน้าหลัก
                </button>
              </li>
              <li className="text-base-content/60">
                {selectedCategory === "general"
                  ? "สัญญาจ้างทั่วไป"
                  : "ยื่นโครงการ"}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};