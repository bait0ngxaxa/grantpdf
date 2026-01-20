"use client";

import { Button, LoadingSpinner } from "@/components/ui";
import { useTitle } from "@/lib/hooks/useTitle";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { usePagination } from "@/lib/hooks";
import { PAGINATION } from "@/lib/constants";
import { useCreateDocsContext } from "./CreateDocsContext";

import {
    ProjectSelection,
    MainMenu,
    ContractTypeSubmenu,
    CategorySubmenu,
} from "./components";

export default function CreateDocsPage(): React.JSX.Element {
    const router = useRouter();
    const { data: session, status } = useSession();

    const {
        selectedCategory,
        setSelectedCategory,
        selectedContractType,
        setSelectedContractType,
        selectedProjectId,
        setSelectedProjectId,
        projects,
        isLoading,
        isAdmin,
        handleCategorySelection,
    } = useCreateDocsContext();

    useTitle("เลือกเอกสารที่สร้าง | ระบบจัดการเอกสาร");

    // Local Pagination for Project Selection Step
    const {
        paginatedItems: currentProjects,
        totalPages,
        startIndex: indexOfFirstProject,
        endIndex: indexOfLastProject,
        currentPage,
        goToPage: setCurrentPage,
    } = usePagination({
        items: projects,
        itemsPerPage: PAGINATION.PROJECTS_PER_PAGE,
    });

    // Navigation Handlers (Routing)
    const handleApprovalSelection = (): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/approval?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    };

    const handleContractSelection = (contractCode?: string): void => {
        if (!selectedProjectId) return;
        const params = new URLSearchParams({ projectId: selectedProjectId });
        if (contractCode) {
            params.set("contractCode", contractCode);
        }
        router.push(`/create-word/contract?${params.toString()}`);
    };

    const handleFormProjectSelection = (): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/formproject?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    };

    const handleSummarySelection = (): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/summary?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    };

    const handleTorSelection = (): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/tor?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    };

    return (
        <div className="w-full">
            {status === "loading" && (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            )}

            {/* Not authenticated */}
            {status === "unauthenticated" && (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="text-center">
                        <p className="text-lg text-slate-500 mb-4 dark:text-slate-400">
                            กรุณาเข้าสู่ระบบก่อน
                        </p>
                        <Button
                            onClick={() => router.push(ROUTES.SIGNIN)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all"
                        >
                            เข้าสู่ระบบ
                        </Button>
                    </div>
                </div>
            )}

            {/* Authenticated content */}
            {status === "authenticated" && session && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Conditional rendering based on selected state */}
                    {!selectedProjectId ? (
                        <ProjectSelection
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            isLoading={isLoading}
                            error={null} // Error handled by context/hook mostly, or pass if needed
                            currentProjects={currentProjects}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            indexOfFirstProject={indexOfFirstProject}
                            indexOfLastProject={indexOfLastProject}
                            onProjectSelect={setSelectedProjectId}
                            onPageChange={setCurrentPage}
                        />
                    ) : selectedContractType ? (
                        <ContractTypeSubmenu
                            onContractSelect={handleContractSelection}
                        />
                    ) : selectedCategory ? (
                        <CategorySubmenu
                            selectedCategory={selectedCategory}
                            isAdmin={isAdmin}
                            onApprovalSelect={handleApprovalSelection}
                            onTorSelect={handleTorSelection}
                            onFormProjectSelect={handleFormProjectSelection}
                            onContractTypeSelect={setSelectedContractType}
                            onCategorySelect={setSelectedCategory}
                        />
                    ) : (
                        <MainMenu
                            isAdmin={isAdmin}
                            selectedProjectId={selectedProjectId}
                            onCategorySelect={handleCategorySelection}
                            onSummarySelect={handleSummarySelection}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
