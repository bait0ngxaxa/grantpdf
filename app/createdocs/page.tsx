"use client";

import { Button } from "@/components/ui/button";
import { useTitle } from "@/hooks/useTitle";
import { useSession } from "next-auth/react";

import { useCreateDocsState } from "./hooks/useCreateDocsState";
import { useProjectData } from "./hooks/useProjectData";
import { useNavigation } from "./hooks/useNavigation";
import { usePagination } from "./hooks/usePagination";

import { ProjectSelection } from "./components/ProjectSelection";
import { MainMenu } from "./components/MainMenu";
import { ContractTypeSubmenu } from "./components/ContractTypeSubmenu";
import { CategorySubmenu } from "./components/CategorySubmenu";
import { NavBar } from "./components/NavBar";

export default function CreateTorsPage() {
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
        currentPage,
        setCurrentPage,
        projectsPerPage,
        isAdmin,
    } = useCreateDocsState();

    useProjectData(setProjects, setIsLoading, setError, setSelectedProjectId);

    const {
        handleProjectSelection: handleProjectSelectionBase,
        handleBack: handleBackBase,
        handleCategorySelection: handleCategorySelectionBase,
        handleApprovalSelection,
        handleContractSelection,
        handleFormProjectSelection,
        handleSummarySelection,
        handleTorSelection,
    } = useNavigation();

    const {
        currentProjects,
        totalPages,
        indexOfFirstProject,
        indexOfLastProject,
    } = usePagination(projects, currentPage, projectsPerPage);

    useTitle("เลือกเอกสารที่สร้าง | ระบบจัดการเอกสาร");

    const handleProjectSelection = (projectId: string) => {
        setSelectedProjectId(projectId);
        handleProjectSelectionBase(projectId);
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
        <div className="max-w-6xl mx-auto min-h-screen bg-base-200 text-base-content p-6 flex flex-col">
            {status === "loading" && (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="mt-4 text-lg">กำลังโหลด...</p>
                    </div>
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
                            onClick={() => (window.location.href = "/signin")}
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
