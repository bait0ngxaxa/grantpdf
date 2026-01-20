"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProjectsList } from "./ProjectsList";
import { Pagination } from "@/components/ui";
import { useUserDashboardContext } from "../UserDashboardContext";

export const ProjectsTab = (): React.JSX.Element => {
    const router = useRouter();
    const {
        projects,
        paginatedProjects,
        expandedProjects,
        toggleProjectExpansion,
        handleEditProject,
        handleDeleteProject,
        openPreviewModal,
        handleDeleteFile,
        setShowCreateProjectModal,
        currentPage,
        totalPages,
        setCurrentPage,
    } = useUserDashboardContext();

    return (
        <>
            <ProjectsList
                projects={paginatedProjects}
                totalProjects={projects.length}
                expandedProjects={expandedProjects}
                toggleProjectExpansion={toggleProjectExpansion}
                handleEditProject={handleEditProject}
                handleDeleteProject={handleDeleteProject}
                openPreviewModal={openPreviewModal}
                handleDeleteFile={handleDeleteFile}
                setShowCreateProjectModal={setShowCreateProjectModal}
                router={router}
            />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </>
    );
};
