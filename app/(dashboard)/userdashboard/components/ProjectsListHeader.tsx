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
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <span className="bg-blue-100 p-2 rounded-xl text-blue-600">
                    <Building2 className="h-6 w-6" />
                </span>
                โครงการทั้งหมด
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {totalProjects}
                </span>
            </h2>
            <Button
                onClick={onCreateProject}
                className="cursor-pointer transform hover:scale-105 transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/30"
            >
                <Plus className="h-5 w-5 mr-2" />
                สร้างโครงการใหม่
            </Button>
        </div>
    );
};
