import React from "react";
import { Button } from "@/components/ui/button";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Project } from "../hooks/useUserData";

interface CreateProjectTabProps {
    projects: Project[];
    setShowCreateProjectModal: (show: boolean) => void;
    router: AppRouterInstance;
}

export const CreateProjectTab: React.FC<CreateProjectTabProps> = ({
    projects,
    setShowCreateProjectModal,
    router,
}) => {
    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </div>

                {/* แสดงเนื้อหาแตกต่างกันตามว่ามีโครงการหรือไม่ */}
                {projects.length === 0 ? (
                    // กรณียังไม่มีโครงการ - แสดงเฉพาะปุ่มสร้างโครงการ
                    <>
                        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                            เริ่มต้นสร้างโครงการแรก
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                            ยินดีต้อนรับ!
                            เริ่มต้นด้วยการสร้างโครงการแรกของคุณเพื่อจัดการเอกสารอย่างเป็นระบบ
                        </p>
                        <div className="flex justify-center">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary-focus text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300 px-8 py-4"
                                onClick={() => setShowCreateProjectModal(true)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 mr-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                                สร้างโครงการแรกของฉัน
                            </Button>
                        </div>
                    </>
                ) : (
                    // กรณีมีโครงการแล้ว - แสดงปุ่มทั้งสาม
                    <>
                        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                            สร้างโครงการใหม่ | สร้างเอกสาร
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                            เริ่มต้นด้วยการสร้างโครงการใหม่
                            หรือเลือกโครงการที่มีอยู่แล้วเพื่อเพิ่มเอกสาร
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary-focus text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                onClick={() => setShowCreateProjectModal(true)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                                สร้างโครงการใหม่
                            </Button>
                            <Button
                                size="lg"
                                className="bg-green-500 hover:bg-green-600 text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                onClick={() => router.push("/createdocs")}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                สร้างเอกสารในโครงการ
                            </Button>
                            <Button
                                size="lg"
                                className="bg-info hover:bg-info-focus text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                                onClick={() => router.push("/uploads-doc")}
                                variant="outline"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 13l3-3m0 0l3 3m-3-3v12"
                                    />
                                </svg>
                                อัพโหลดเอกสาร
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
