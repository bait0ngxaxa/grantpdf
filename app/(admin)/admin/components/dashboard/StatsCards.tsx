import React from "react";
import { Archive, Plus, FilePlus, Clock, ClipboardList, Upload } from "lucide-react";

interface StatsCardsProps {
    totalProjects: number;
    todayProjects: number;
    totalFiles: number;
    todayProjectFiles: number;
    todayReportFiles: number;
    setActiveTab: (tab: string) => void;
}

function ActivityDot({
    pingClassName,
    dotClassName,
}: {
    pingClassName: string;
    dotClassName: string;
}): React.JSX.Element {
    return (
        <span
            aria-hidden="true"
            className="absolute right-4 top-4 flex h-2.5 w-2.5"
        >
            <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${pingClassName}`}
            />
            <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotClassName}`}
            />
        </span>
    );
}

function InlineActivityDot({ className }: { className: string }): React.JSX.Element {
    return (
        <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${className}`}
        />
    );
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    totalProjects,
    todayProjects,
    totalFiles,
    todayProjectFiles,
    todayReportFiles,
    setActiveTab,
}) => {
    const formatStat = (value: number): string =>
        new Intl.NumberFormat("th-TH").format(value);

    return (
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {/* Total Projects Card */}
            <div className="relative min-w-0 overflow-hidden rounded-2xl border border-blue-100/70 bg-white/90 p-5 shadow-sm shadow-blue-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-blue-100/60 dark:border-blue-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-300/70 to-transparent" />
                <div className="relative z-10 flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/40 dark:text-blue-300">
                        <Archive className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="mb-2 break-words text-xs font-bold text-slate-500 dark:text-slate-400">
                            โครงการทั้งหมด
                        </div>
                        <div className="mb-2 break-words text-3xl font-black leading-none text-slate-900 dark:text-slate-100">
                            {formatStat(totalProjects)}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            โครงการในระบบ
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's New Projects Card */}
            <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-emerald-100/70 bg-white/90 p-5 shadow-sm shadow-emerald-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-emerald-100/60 dark:border-emerald-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900">
                {todayProjects > 0 && (
                    <ActivityDot
                        pingClassName="bg-emerald-500"
                        dotClassName="bg-emerald-600 dark:bg-emerald-400"
                    />
                )}
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/70 to-transparent" />
                <div className="relative z-10 flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Plus className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="min-w-0">
                            <div className="mb-2 break-words pr-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                โครงการใหม่วันนี้
                            </div>
                            <div className="mb-2 flex min-w-0 items-center gap-2 break-words text-3xl font-black leading-none text-emerald-600 dark:text-emerald-300">
                                {formatStat(todayProjects)}
                            </div>
                        </div>
                        <div className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                            โครงการที่สร้างวันนี้
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Documents Card */}
            <button
                type="button"
                aria-label="เปิดหน้าจัดการโครงการและเอกสาร"
                className="group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/90 p-5 text-left shadow-sm shadow-indigo-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 dark:border-indigo-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-900"
                onClick={() => setActiveTab("documents")}
            >
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-300/70 to-transparent" />
                <div className="relative z-10 flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/40 dark:text-indigo-300">
                        <FilePlus className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="mb-2 break-words text-xs font-bold text-slate-500 dark:text-slate-400">
                            จำนวนเอกสาร
                        </div>
                        <div className="mb-2 break-words text-3xl font-black leading-none text-indigo-600 dark:text-indigo-300">
                            {formatStat(totalFiles)}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            เอกสารทั้งหมดในระบบ
                        </div>
                    </div>
                </div>
            </button>

            {/* Today's Files Card */}
            <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-orange-100/70 bg-white/90 p-5 shadow-sm shadow-orange-100/40 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-orange-100/60 dark:border-orange-900/35 dark:bg-slate-900/80 dark:shadow-none dark:hover:bg-slate-900">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-300/70 to-transparent" />
                <div className="relative z-10 flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 shadow-sm dark:bg-orange-950/40 dark:text-orange-300">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <dl className="grid min-w-0 gap-2">
                            <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-orange-50/70 px-2.5 py-2 dark:bg-orange-950/20">
                                <dt className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <Upload className="h-3.5 w-3.5 shrink-0 text-orange-500 dark:text-orange-300" />
                                    <span className="truncate">ไฟล์ในโครงการ</span>
                                    {todayProjectFiles > 0 && (
                                        <InlineActivityDot className="bg-orange-500 dark:bg-orange-300" />
                                    )}
                                </dt>
                                <dd className="shrink-0 break-words text-base font-black leading-none text-orange-800 dark:text-orange-100">
                                    {formatStat(todayProjectFiles)}
                                </dd>
                            </div>
                            <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-sky-50/70 px-2.5 py-2 dark:bg-sky-950/20">
                                <dt className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <ClipboardList className="h-3.5 w-3.5 shrink-0 text-sky-500 dark:text-sky-300" />
                                    <span className="truncate">ไฟล์ส่งรายงาน</span>
                                    {todayReportFiles > 0 && (
                                        <InlineActivityDot className="bg-sky-500 dark:bg-sky-300" />
                                    )}
                                </dt>
                                <dd className="shrink-0 break-words text-base font-black leading-none text-sky-800 dark:text-sky-100">
                                    {formatStat(todayReportFiles)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};


