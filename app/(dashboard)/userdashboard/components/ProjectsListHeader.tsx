import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";

interface ProjectsListHeaderProps {
    totalProjects: number;
    onCreateProject: () => void;
}

export const ProjectsListHeader: React.FC<ProjectsListHeaderProps> = ({
    totalProjects,
    onCreateProject,
}): React.JSX.Element => {
    return (
        <div className="mb-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="flex min-w-0 flex-wrap items-center gap-3 text-xl font-bold text-slate-800 text-balance dark:text-slate-100 sm:text-2xl">
                <span className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                    <Building2 className="h-6 w-6" />
                </span>
                โครงการทั้งหมด
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    {totalProjects}
                </span>
            </h2>
            <Button
                onClick={onCreateProject}
                className="w-full cursor-pointer rounded-full bg-blue-600 px-4 text-white shadow-lg shadow-blue-500/30 transition duration-300 hover:scale-105 hover:bg-blue-700 sm:w-auto sm:px-6"
            >
                <Plus className="h-5 w-5 mr-2" />
                สร้างโครงการใหม่
            </Button>
        </div>
    );
};
