import React from "react";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

interface EmptyProjectsStateProps {
    onCreateProject: () => void;
}

export const EmptyProjectsState: React.FC<EmptyProjectsStateProps> = ({
    onCreateProject,
}): React.JSX.Element => {
    return (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-12 w-12 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
                ยังไม่มีโครงการ
            </h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                เริ่มต้นใช้งานระบบโดยการสร้างโครงการใหม่เพื่อจัดการเอกสารของคุณ
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
