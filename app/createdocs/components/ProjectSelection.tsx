"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./ProjectCard";
import { PaginationControls } from "./PaginationControls";
import { EmptyState } from "./EmptyState";
import type { Project } from "@/type/models";

interface ProjectSelectionProps {
    projects: Project[];
    selectedProjectId: string | null;
    isLoading: boolean;
    error: string | null;
    currentProjects: Project[];
    currentPage: number;
    totalPages: number;
    indexOfFirstProject: number;
    indexOfLastProject: number;
    onProjectSelect: (projectId: string) => void;
    onPageChange: (page: number) => void;
}

export const ProjectSelection = ({
    projects,
    selectedProjectId,
    isLoading,
    error,
    currentProjects,
    currentPage,
    totalPages,
    indexOfFirstProject,
    indexOfLastProject,
    onProjectSelect,
    onPageChange,
}: ProjectSelectionProps) => {
    const router = useRouter();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">
                เลือกโครงการสำหรับเอกสาร
            </h1>

            {isLoading && <EmptyState type="loading" />}

            {error && <EmptyState type="error" error={error} />}

            {!isLoading && !error && projects.length === 0 && (
                <EmptyState type="no-projects" />
            )}

            {!isLoading && !error && projects.length > 0 && (
                <>
                    <div className="w-full max-w-4xl space-y-4 max-h-[60vh] overflow-y-auto px-2 py-2">
                        {currentProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                selectedProjectId={selectedProjectId}
                                onProjectSelect={onProjectSelect}
                            />
                        ))}
                    </div>

                    <div className="w-full max-w-4xl mt-6">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                        />
                    </div>

                    {/* Project Info */}
                    {projects.length > 0 && (
                        <div className="text-center mt-4 text-sm text-slate-500">
                            แสดง {indexOfFirstProject + 1}-
                            {Math.min(indexOfLastProject, projects.length)} จาก{" "}
                            {projects.length} โครงการ
                        </div>
                    )}

                    <div className="flex justify-center mt-8 gap-4">
                        <Button
                            onClick={() => router.push("/userdashboard")}
                            variant="outline"
                            className="bg-white hover:bg-slate-50 rounded-xl"
                        >
                            กลับไปแดชบอร์ด
                        </Button>
                        <Button
                            onClick={() => router.push("/userdashboard")}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all"
                        >
                            สร้างโครงการใหม่
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
