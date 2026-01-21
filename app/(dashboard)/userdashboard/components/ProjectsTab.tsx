"use client";

import React from "react";
import { ProjectsList } from "./ProjectsList";
import { Pagination } from "@/components/ui";
import { useUserDashboardContext } from "../UserDashboardContext";

export const ProjectsTab = (): React.JSX.Element => {
    const { currentPage, totalPages, setCurrentPage } =
        useUserDashboardContext();

    return (
        <>
            <ProjectsList />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </>
    );
};
