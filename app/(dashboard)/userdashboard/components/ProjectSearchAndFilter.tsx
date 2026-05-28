"use client";

import { Search } from "lucide-react";
import useSWR from "swr";
import {
    API_ROUTES,
    SORT_OPTIONS,
    STATUS_FILTER,
    STATUS_ORDER,
} from "@/lib/constants";
import type { ProgramSummary } from "@/type/models";

interface ProjectSearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
    selectedProgramFilterId: string;
    setSelectedProgramFilterId: (value: string) => void;
}

interface ProgramsResponse {
    programs: ProgramSummary[];
}

function isProgramsResponse(value: unknown): value is ProgramsResponse {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    return Array.isArray((value as Partial<ProgramsResponse>).programs);
}

async function fetchPrograms(): Promise<ProgramSummary[]> {
    const response = await fetch(API_ROUTES.PROGRAMS);
    if (!response.ok) {
        throw new Error("Failed to fetch programs");
    }

    const data: unknown = await response.json();
    return isProgramsResponse(data) ? data.programs : [];
}

export function ProjectSearchAndFilter({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedStatus,
    setSelectedStatus,
    selectedProgramFilterId,
    setSelectedProgramFilterId,
}: ProjectSearchAndFilterProps): React.JSX.Element {
    const { data: programs = [] } = useSWR(API_ROUTES.PROGRAMS, fetchPrograms, {
        keepPreviousData: true,
    });

    return (
        <div className="sticky top-32 z-40 mb-6 flex min-w-0 flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-100 bg-white/95 p-2 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95 dark:shadow-slate-950/30 sm:top-32 lg:top-28 lg:flex-row lg:items-center">
            <div className="relative w-full min-w-0 lg:w-96">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                    type="text"
                    placeholder="ค้นหาเลขโครงการ, โครงการย่อย, ไฟล์ หรือโครงการหลัก..."
                    className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pr-3 pl-10 text-slate-900 placeholder-slate-400 transition duration-150 ease-in-out focus:bg-white focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-700 sm:text-sm"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
            </div>

            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                    <select
                        className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white py-2.5 pr-10 pl-3 text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:text-sm"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                    >
                        <option value={SORT_OPTIONS.CREATED_AT_DESC}>
                            ล่าสุดมาก่อน
                        </option>
                        <option value={SORT_OPTIONS.CREATED_AT_ASC}>
                            เก่าสุดมาก่อน
                        </option>
                    </select>
                </div>

                <div className="relative flex-1 sm:flex-none">
                    <select
                        className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white py-2.5 pr-10 pl-3 text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:text-sm"
                        value={selectedProgramFilterId}
                        onChange={(event) =>
                            setSelectedProgramFilterId(event.target.value)
                        }
                    >
                        <option value="">ทุกโครงการหลัก</option>
                        {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                                {program.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1 sm:flex-none">
                    <select
                        className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white py-2.5 pr-10 pl-3 text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:text-sm"
                        value={selectedStatus}
                        onChange={(event) => setSelectedStatus(event.target.value)}
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
