"use client";

import React from "react";

interface SearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
}

export default function SearchAndFilter({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedStatus,
    setSelectedStatus,
}: SearchAndFilterProps) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                        className="h-5 w-5 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="ค้นหาชื่อโครงการ, ไฟล์ หรือ ผู้สร้าง..."
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                    <select
                        className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm rounded-xl text-slate-600 font-medium cursor-pointer hover:bg-slate-50 transition-colors"
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
                        className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm rounded-xl text-slate-600 font-medium cursor-pointer hover:bg-slate-50 transition-colors"
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
