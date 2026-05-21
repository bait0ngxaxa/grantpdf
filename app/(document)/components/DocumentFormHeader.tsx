import { BadgeCheck, FileText, ListChecks } from "lucide-react";

interface DocumentFormHeaderProps {
    title: string;
    subtitle?: string;
}

export function DocumentFormHeader({
    title,
    subtitle,
}: DocumentFormHeaderProps): React.JSX.Element {
    return (
        <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-900 md:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
                        <FileText className="size-3.5" />
                        Document Builder
                    </div>
                    <h2 className="text-2xl font-bold tracking-normal text-slate-950 text-balance dark:text-slate-50 md:text-3xl">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:w-[360px]">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/80">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            <ListChecks className="size-4 text-blue-600 dark:text-blue-400" />
                            กรอกเป็นขั้นตอน
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            ระบุข้อมูลตามหมวดหมู่ของเอกสารให้ครบถ้วน
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/80">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            <BadgeCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                            ตรวจสอบก่อนสร้าง
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            ระบบจะแสดง preview ให้ยืนยันก่อนสร้างไฟล์
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
