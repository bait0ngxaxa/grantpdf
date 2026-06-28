"use client";

import { useState } from "react";
import { type ProjectListReturn } from "./types";
import { API_ROUTES } from "@/lib/shared/constants";
import useSWR from "swr";
import type { ProjectSummariesApiResponse } from "@/type";

interface UseProjectListProps {
    initialProjectId: string | null;
}

export function useProjectList({
    initialProjectId,
}: UseProjectListProps): ProjectListReturn {
    const { data, error, isLoading } = useSWR<ProjectSummariesApiResponse>(
        API_ROUTES.PROJECTS_SUMMARY,
    );

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        initialProjectId,
    );

    const projects = data?.projects || [];
    const projectError = error ? "เกิดข้อผิดพลาดในการโหลดรายการโครงการ" : null;
    const isLoadingProjects = isLoading;

    return {
        projects,
        selectedProjectId,
        setSelectedProjectId,
        isLoadingProjects,
        projectError,
    };
}
