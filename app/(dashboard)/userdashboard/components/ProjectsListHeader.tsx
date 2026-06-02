import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProjectsListHeaderProps {
    totalProjects: number;
    onCreateProject: () => void;
}

export const ProjectsListHeader: React.FC<ProjectsListHeaderProps> = ({
    totalProjects,
    onCreateProject,
}): React.JSX.Element => {
    return (
        <div className="mb-6 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-blue-100/70 bg-white/80 px-4 py-3 shadow-sm shadow-blue-100/50 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-none sm:flex-row sm:items-center">
            <p className="min-w-0 text-sm font-bold text-slate-700 dark:text-slate-200 sm:text-base">
                รายการโครงการ{" "}
                <span className="text-blue-600 dark:text-blue-300">
                    {totalProjects}
                </span>{" "}
                รายการ
            </p>
            <Button
                onClick={onCreateProject}
                className="w-full cursor-pointer rounded-full bg-blue-600 px-4 text-white shadow-lg shadow-blue-500/30 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-500/40 sm:w-auto sm:px-6"
            >
                <Plus className="h-5 w-5 mr-2" />
                สร้างโครงการใหม่
            </Button>
        </div>
    );
};
