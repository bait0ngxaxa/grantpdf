"use client";

import { Search } from "lucide-react";
import {
    PROJECT_STATUS,
    SORT_OPTIONS,
    STATUS_FILTER,
    STATUS_ORDER,
} from "@/lib/constants";

interface SearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
}

const statusSortOptions = [
    { value: SORT_OPTIONS.STATUS_EDIT, label: `สถานะ: ${PROJECT_STATUS.EDIT}` },
    { value: SORT_OPTIONS.STATUS_APPROVED, label: `สถานะ: ${PROJECT_STATUS.APPROVED}` },
    { value: SORT_OPTIONS.STATUS_PENDING, label: "สถานะ: ดำเนินการ" },
    { value: SORT_OPTIONS.STATUS_REJECTED, label: `สถานะ: ${PROJECT_STATUS.REJECTED}` },
    { value: SORT_OPTIONS.STATUS_CLOSED, label: `สถานะ: ${PROJECT_STATUS.CLOSED}` },
] as const;

export default function SearchAndFilter({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedStatus,
    setSelectedStatus,
}: SearchAndFilterProps): React.JSX.Element {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="relative w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                    type="text"
                    placeholder="ค้นหาชื่อโครงการ, ไฟล์ หรือ ผู้สร้าง…"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl leading-5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                    <select
                        className="block w-full pl-3 pr-10 py-2.5 text-base border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 sm:text-sm rounded-xl text-slate-600 dark:text-slate-300 font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value={SORT_OPTIONS.CREATED_AT_DESC}>
                            ล่าสุดมาก่อน
                        </option>
                        <option value={SORT_OPTIONS.CREATED_AT_ASC}>
                            เก่าสุดมาก่อน
                        </option>
                        {statusSortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1 sm:flex-none">
                    <select
                        className="block w-full pl-3 pr-10 py-2.5 text-base border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 sm:text-sm rounded-xl text-slate-600 dark:text-slate-300 font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value={STATUS_FILTER.ALL}>ทุกสถานะ</option>
                        {STATUS_ORDER.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
