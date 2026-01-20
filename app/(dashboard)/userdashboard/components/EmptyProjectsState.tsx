import React from "react";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";

interface EmptyProjectsStateProps {
    onCreateProject: () => void;
}

export const EmptyProjectsState: React.FC<EmptyProjectsStateProps> = ({
    onCreateProject,
}): React.JSX.Element => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderPlus className="h-10 w-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">
                ยังไม่มีโครงการ
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                เริ่มต้นสร้างโครงการแรกของคุณเพื่อจัดการเอกสารอย่างเป็นระบบ
            </p>
            <Button
                onClick={onCreateProject}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-blue-500/30 border-0"
            >
                สร้างโครงการแรกของคุณ
            </Button>
        </div>
    );
};
