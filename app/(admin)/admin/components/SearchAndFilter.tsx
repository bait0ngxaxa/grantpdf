"use client";

interface SearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
}

import { Search } from "lucide-react";

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
                    placeholder="ค้นหาชื่อโครงการ, ไฟล์ หรือ ผู้สร้าง..."
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl leading-5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                    <select
                        className="block w-full pl-3 pr-10 py-2.5 text-base border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm rounded-xl text-slate-600 dark:text-slate-300 font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="createdAtDesc">ล่าสุดมาก่อน</option>
                        <option value="createdAtAsc">เก่าสุดมาก่อน</option>
                        <option value="statusEdit">สถานะ: แก้ไข</option>
                        <option value="statusApproved">สถานะ: อนุมัติ</option>
                        <option value="statusPending">สถานะ: ดำเนินการ</option>
                        <option value="statusRejected">
                            สถานะ: ไม่อนุมัติ
                        </option>
                        <option value="statusClosed">สถานะ: ปิดโครงการ</option>
                    </select>
                </div>

                <div className="relative flex-1 sm:flex-none">
                    <select
                        className="block w-full pl-3 pr-10 py-2.5 text-base border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm rounded-xl text-slate-600 dark:text-slate-300 font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="สถานะทั้งหมด">ทุกสถานะ</option>
                        <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                        <option value="อนุมัติ">อนุมัติ</option>
                        <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                        <option value="แก้ไข">แก้ไข</option>
                        <option value="ปิดโครงการ">ปิดโครงการ</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
