import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { Folder, Calendar, ChevronRight } from "lucide-react";
import type { Project } from "@/type";

type ProjectListItem = Pick<
    Project,
    "id" | "name" | "description" | "created_at"
>;

interface ProjectListProps {
    projects: ProjectListItem[];
    selectedProjectId: string | null;
    onSelectProject: (id: string) => void;
    isLoading: boolean;
    error: string | null;
}

export function ProjectList({
    projects,
    selectedProjectId,
    onSelectProject,
    isLoading,
    error,
}: ProjectListProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-blue-600" />
                    เลือกโครงการ
                </h3>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-center">
                        <p className="text-yellow-800 text-sm mb-3">
                            ไม่พบโครงการ กรุณาสร้างโครงการก่อน
                        </p>
                        <Button
                            onClick={() => router.push("/createproject")}
                            className="cursor-pointer bg-yellow-600 hover:bg-yellow-700 text-white"
                            size="sm"
                        >
                            สร้างโครงการใหม่
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className={`group relative bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                    selectedProjectId === project.id
                                        ? "ring-2 ring-blue-500 shadow-md bg-blue-50/30"
                                        : "hover:shadow-md border border-gray-200 hover:border-blue-300"
                                }`}
                                onClick={() => onSelectProject(project.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                                            selectedProjectId === project.id
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"
                                        }`}
                                    >
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-700">
                                            {project.name}
                                        </h4>
                                        {project.description && (
                                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(
                                                project.created_at
                                            ).toLocaleDateString("th-TH", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </div>
                                    </div>
                                    {selectedProjectId === project.id && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                                <ChevronRight className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {projects.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3 text-right">
                        เลือกโครงการที่ต้องการอัพโหลดไฟล์เข้าไป
                    </p>
                )}
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs">
                        i
                    </span>
                    คำแนะนำการใช้งาน
                </h4>
                <ul className="text-sm text-blue-700 space-y-2 pl-2">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        เลือกโครงการจากรายการด้านบน
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        รองรับไฟล์ .docx และ .pdf
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        ขนาดไฟล์สูงสุด 10MB
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        สามารถลากไฟล์มาวางในพื้นที่อัพโหลดได้
                    </li>
                </ul>
            </div>
        </div>
    );
}
