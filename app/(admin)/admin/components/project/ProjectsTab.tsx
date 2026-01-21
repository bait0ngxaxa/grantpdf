"use client";

import React from "react";
import SearchAndFilter from "../SearchAndFilter";
import ProjectsList from "./ProjectsList";
import { Pagination } from "@/components/ui";
import { useAdminDashboardContext } from "../../contexts";
import { useAdminProjectFilter } from "../../hooks";
import { usePagination } from "@/lib/hooks";
import { PAGINATION } from "@/lib/constants";

const itemsPerPage = PAGINATION.ITEMS_PER_PAGE;

export const ProjectsTab = (): React.JSX.Element => {
    const {
        projects,
        orphanFiles,
        isLoading,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        selectedFileType,
        selectedStatus,
        setSelectedStatus,
        expandedProjects,
        viewedProjects,
    } = useAdminDashboardContext();

    const filteredAndSortedProjects = useAdminProjectFilter({
        projects,
        orphanFiles,
        searchTerm,
        selectedFileType,
        selectedStatus,
        sortBy,
    });

    // Pagination
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems: paginatedProjects,
        startIndex,
        endIndex,
        totalItems,
    } = usePagination({
        items: filteredAndSortedProjects.projects,
        itemsPerPage,
    });

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
                projects={paginatedProjects}
                isLoading={isLoading}
                expandedProjects={expandedProjects}
                viewedProjects={viewedProjects}
                totalItems={totalItems}
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
