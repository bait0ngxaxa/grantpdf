"use client";

import { useState, useEffect } from "react";
import { type Session } from "next-auth";
import { type ProjectListReturn, type ProjectListItem } from "./types";
import { API_ROUTES } from "@/lib/constants";

interface UseProjectListProps {
    session: Session | null;
    initialProjectId: string | null;
}

export function useProjectList({
    session,
    initialProjectId,
}: UseProjectListProps): ProjectListReturn {
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        initialProjectId,
    );
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [projectError, setProjectError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async (): Promise<void> => {
            if (!session) return;

            try {
                setIsLoadingProjects(true);
                setProjectError(null);

                const response = await fetch(API_ROUTES.PROJECTS);
                if (!response.ok) {
                    throw new Error("ไม่สามารถโหลดรายการโครงการได้");
                }

                const data = await response.json();
                setProjects(data.projects || []);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setProjectError("เกิดข้อผิดพลาดในการโหลดรายการโครงการ");
            } finally {
                setIsLoadingProjects(false);
            }
        };

        if (session) {
            fetchProjects();
        }
    }, [session]);

    return {
        projects,
        selectedProjectId,
        setSelectedProjectId,
        isLoadingProjects,
        projectError,
    };
}
