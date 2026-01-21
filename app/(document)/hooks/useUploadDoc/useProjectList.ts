"use client";

import { useState } from "react";
import { type Session } from "next-auth";
import { type ProjectListReturn } from "./types";
import { API_ROUTES } from "@/lib/constants";
import useSWR from "swr";
import type { Project } from "@/type/models";

interface UseProjectListProps {
    session: Session | null;
    initialProjectId: string | null;
}

interface ProjectsResponse {
    projects: Project[];
}

export function useProjectList({
    initialProjectId,
}: UseProjectListProps): ProjectListReturn {
    const { data, error, isLoading } = useSWR<ProjectsResponse>(
        API_ROUTES.PROJECTS,
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
