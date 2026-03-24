"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./ProjectCard";
import {
    Pagination,
    LoadingSpinner,
    EmptyState as SharedEmptyState,
} from "@/components/ui";
import { Building2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useCreateDocsContext } from "../contexts";

export const ProjectSelection = (): React.JSX.Element => {
    const {
        projects,
        isLoading,
        error,
        currentProjects,
        currentPage,
        totalPages,
        indexOfFirstProject,
        indexOfLastProject,
        setCurrentPage,
    } = useCreateDocsContext();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100 text-balance">
                เลือกโครงการสำหรับเอกสาร
            </h1>

            {isLoading ? <LoadingSpinner message="กำลังโหลดโครงการ…" /> : null}

            {error && (
                <SharedEmptyState
                    title="เกิดข้อผิดพลาด"
                    description={error || "ไม่สามารถโหลดข้อมูลได้"}
                    icon={Building2}
                >
                    <Button
                        asChild
                        className="mt-4"
                    >
                        <Link href={ROUTES.DASHBOARD}>กลับไปแดชบอร์ด</Link>
                    </Button>
                </SharedEmptyState>
            )}

            {!isLoading && !error && projects.length === 0 && (
                <SharedEmptyState
                    title="ยังไม่มีโครงการ"
                    description="กรุณาสร้างโครงการก่อนสร้างเอกสาร"
                    icon={Building2}
                >
                    <Button asChild>
                        <Link href={ROUTES.DASHBOARD}>สร้างโครงการใหม่</Link>
                    </Button>
                </SharedEmptyState>
            )}

            {!isLoading && !error && projects.length > 0 && (
                <>
                    <div className="w-full max-w-4xl space-y-4 max-h-[60vh] overflow-y-auto px-2 py-2">
                        {currentProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>

                    <div className="w-full max-w-4xl mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>

                    {/* Project Info */}
                    {projects.length > 0 && (
                        <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                            แสดง {indexOfFirstProject + 1}-
                            {Math.min(indexOfLastProject, projects.length)} จาก{" "}
                            {projects.length} โครงการ
                        </div>
                    )}

                    <div className="flex justify-center mt-8 gap-4">
                        <Button
                            asChild
                            variant="outline"
                            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl"
                        >
                            <Link href={ROUTES.DASHBOARD}>กลับไปแดชบอร์ด</Link>
                        </Button>
                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition"
                        >
                            <Link href={ROUTES.DASHBOARD}>สร้างโครงการใหม่</Link>
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
