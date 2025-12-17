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
        <div className="container mx-auto max-w-6xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-center mb-8">
                เลือกโครงการสำหรับเอกสาร
            </h1>

            {isLoading && <EmptyState type="loading" />}

            {error && <EmptyState type="error" error={error} />}

            {!isLoading && !error && projects.length === 0 && (
                <EmptyState type="no-projects" />
            )}

            {!isLoading && !error && projects.length > 0 && (
                <>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
                        {currentProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                selectedProjectId={selectedProjectId}
                                onProjectSelect={onProjectSelect}
                            />
                        ))}
                    </div>

                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />

                    {/* Project Info */}
                    {projects.length > 0 && (
                        <div className="text-center mt-4 text-sm text-base-content/60">
                            แสดง {indexOfFirstProject + 1}-
                            {Math.min(indexOfLastProject, projects.length)} จาก{" "}
                            {projects.length} โครงการ
                        </div>
                    )}

                    <div className="flex justify-center mt-8 gap-4">
                        <Button
                            onClick={() => router.push("/userdashboard")}
                            variant="outline"
                        >
                            กลับไปแดชบอร์ด
                        </Button>
                        <Button
                            onClick={() => router.push("/userdashboard")}
                            variant="outline"
                        >
                            สร้างโครงการใหม่
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
