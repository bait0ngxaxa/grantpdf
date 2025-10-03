"use client";

import { Button } from "@/components/ui/button";
import { useTitle } from "@/hook/useTitle";
import { useSession } from "next-auth/react";

// Import custom hooks
import { useCreateDocsState } from "./hooks/useCreateDocsState";
import { useProjectData } from "./hooks/useProjectData";
import { useNavigation } from "./hooks/useNavigation";
import { usePagination } from "./hooks/usePagination";

// Import components
import { ProjectSelection } from "./components/ProjectSelection";
import { MainMenu } from "./components/MainMenu";
import { ContractTypeSubmenu } from "./components/ContractTypeSubmenu";
import { CategorySubmenu } from "./components/CategorySubmenu";
import { NavBar } from "./components/NavBar";

// Define the type for the form data to ensure type safety
interface TorsData {
  projectName: string;
  clientName: string;
  projectDescription: string;
  scopeOfWork: string;
  startDate: string;
  endDate: string;
  budget: number;
  contactPerson: string;
}

// Define the type for project templates
interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  initialData: TorsData;
}

export default function CreateTorsPage() {
  const { data: session, status } = useSession();
  
  // Custom hooks for state management
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

  // Project data management
  useProjectData(setProjects, setIsLoading, setError, setSelectedProjectId);

  // Navigation handlers
  const {
    handleProjectSelection: handleProjectSelectionBase,
    handleBackToProjects,
    handleBack: handleBackBase,
    handleCategorySelection: handleCategorySelectionBase,
    handleApprovalSelection,
    handleContractSelection,
    handleFormProjectSelection,
    handleSummarySelection,
    handleTorSelection,
  } = useNavigation();

  // Pagination logic
  const { currentProjects, totalPages, indexOfFirstProject, indexOfLastProject } = usePagination(
    projects,
    currentPage,
    projectsPerPage
  );

  useTitle("เลือกเอกสารที่สร้าง | ระบบจัดการเอกสาร");

  // Wrapper functions to integrate with state
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
      {/* Loading state */}
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
            <p className="text-lg text-red-500 mb-4">กรุณาเข้าสู่ระบบก่อน</p>
            <Button onClick={() => window.location.href = "/signin"}>เข้าสู่ระบบ</Button>
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