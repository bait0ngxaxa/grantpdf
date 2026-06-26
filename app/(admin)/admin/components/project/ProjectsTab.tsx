"use client";

import React from "react";
import SearchAndFilter from "../SearchAndFilter";
import ProjectsList from "./ProjectsList";
import { useAdminDashboardContext } from "../../contexts";

export const ProjectsTab = (): React.JSX.Element => {
    const {
        projects,
        isLoading,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        selectedStatus,
        setSelectedStatus,
        selectedProgramFilterId,
        setSelectedProgramFilterId,
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
                selectedProgramFilterId={selectedProgramFilterId}
                setSelectedProgramFilterId={setSelectedProgramFilterId}
            />

            <ProjectsList
                projects={projects}
                isLoading={isLoading}
                searchTerm={searchTerm}
                sortBy={sortBy}
                selectedStatus={selectedStatus}
            />
        </div>
    );
};
