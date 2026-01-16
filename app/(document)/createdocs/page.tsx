"use client";

import { Button, LoadingSpinner } from "@/components/ui";
import { useTitle } from "@/lib/hooks/useTitle";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/lib/constants";

import { useCreateDocsState, useProjectData, useNavigation } from "./hooks";

import {
    ProjectSelection,
    MainMenu,
    ContractTypeSubmenu,
    CategorySubmenu,
    NavBar,
} from "./components";

import { usePagination } from "@/lib/hooks";
import { PAGINATION } from "@/lib/constants";

import { useRouter } from "next/navigation";

export default function CreateTorsPage() {
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
        setProjects,
        isLoading,
        setIsLoading,
        error,
        setError,
        isAdmin,
    } = useCreateDocsState();

    useProjectData(setProjects, setIsLoading, setError, setSelectedProjectId);

    const {
        handleBack: handleBackBase,
        handleCategorySelection: handleCategorySelectionBase,
        handleApprovalSelection,
        handleContractSelection,
        handleFormProjectSelection,
        handleSummarySelection,
        handleTorSelection,
    } = useNavigation({ selectedProjectId });

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

    useTitle("เลือกเอกสารที่สร้าง | ระบบจัดการเอกสาร");

    const handleProjectSelection = (projectId: string) => {
        setSelectedProjectId(projectId);
    };

    const handleBack = () => {
        handleBackBase(
            selectedContractType,
            selectedProjectId,
            selectedCategory,
            setSelectedContractType,
            setSelectedProjectId,
            setSelectedCategory
        );
    };

    const handleCategorySelection = (category: string) => {
        handleCategorySelectionBase(category, isAdmin, setSelectedCategory);
    };

    return (
        <div className="max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 p-6 flex flex-col">
            {status === "loading" && (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            )}

            {/* Not authenticated */}
            {status === "unauthenticated" && (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="text-center">
                        <p className="text-lg text-red-500 mb-4">
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
                <>
                    {/* Header and Back button */}
                    <NavBar
                        selectedCategory={selectedCategory}
                        selectedContractType={selectedContractType}
                        onBack={handleBack}
                        onCategorySelect={setSelectedCategory}
                        onContractTypeSelect={setSelectedContractType}
                    />

                    {/* Conditional rendering based on selected state */}
                    {!selectedProjectId ? (
                        <ProjectSelection
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            isLoading={isLoading}
                            error={error}
                            currentProjects={currentProjects}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            indexOfFirstProject={indexOfFirstProject}
                            indexOfLastProject={indexOfLastProject}
                            onProjectSelect={handleProjectSelection}
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
                </>
            )}
        </div>
    );
}
