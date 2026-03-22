"use client";

import React from "react";
import SearchAndFilter from "../SearchAndFilter";
import ProjectsList from "./ProjectsList";
import { Pagination } from "@/components/ui";
import { useAdminDashboardContext } from "../../contexts";

export const ProjectsTab = (): React.JSX.Element => {
    const {
        projects,
        isLoading,
        currentPage,
        setCurrentPage,
        totalPages,
        expandedProjects,
        viewedProjects,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        selectedStatus,
        setSelectedStatus,
    } = useAdminDashboardContext();

    return (
        <div>
            <SearchAndFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
            />

            <ProjectsList
                projects={projects}
                isLoading={isLoading}
                expandedProjects={expandedProjects}
                viewedProjects={viewedProjects}
                totalItems={projects.length}
                startIndex={(currentPage - 1) * 5}
                endIndex={Math.min(currentPage * 5, projects.length)}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};
