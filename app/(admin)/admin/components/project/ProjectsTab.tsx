"use client";

import React from "react";
import SearchAndFilter from "../SearchAndFilter";
import ProjectsList from "./ProjectsList";
import { Pagination } from "@/components/ui";
import { useAdminDashboardContext } from "../../AdminDashboardContext";
import { useAdminProjectFilter, useAdminModalStates } from "../../hooks";
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
        toggleProjectExpansion,
    } = useAdminDashboardContext();

    const { openPreviewModal, openStatusModal } = useAdminModalStates();

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
                onToggleProjectExpansion={toggleProjectExpansion}
                onPreviewPdf={openPreviewModal}
                onEditProjectStatus={openStatusModal}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};
