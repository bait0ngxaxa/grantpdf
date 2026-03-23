"use client";

import React from "react";
import SearchAndFilter from "../SearchAndFilter";
import ProjectsList from "./ProjectsList";
import { Pagination } from "@/components/ui";
import { PAGINATION } from "@/lib/constants";
import { useAdminDashboardContext } from "../../contexts";

export const ProjectsTab = (): React.JSX.Element => {
    const {
        projects,
        totalProjects,
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

    const startIndex = (currentPage - 1) * PAGINATION.ITEMS_PER_PAGE;
    const endIndex = startIndex + projects.length;

    return (
        <div>
            <SearchAndFilter
                searchTerm={searchTerm}
                setSearchTerm={(value) => {
                    setCurrentPage(1);
                    setSearchTerm(value);
                }}
                sortBy={sortBy}
                setSortBy={(value) => {
                    setCurrentPage(1);
                    setSortBy(value);
                }}
                selectedStatus={selectedStatus}
                setSelectedStatus={(value) => {
                    setCurrentPage(1);
                    setSelectedStatus(value);
                }}
            />

            <ProjectsList
                projects={projects}
                isLoading={isLoading}
                expandedProjects={expandedProjects}
                viewedProjects={viewedProjects}
                totalItems={totalProjects}
                startIndex={startIndex}
                endIndex={endIndex}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};
