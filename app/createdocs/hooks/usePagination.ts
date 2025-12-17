import type { Project } from "@/type/models";

export interface UsePaginationReturn {
    currentProjects: Project[];
    totalPages: number;
    indexOfFirstProject: number;
    indexOfLastProject: number;
}

export const usePagination = (
    projects: Project[],
    currentPage: number,
    projectsPerPage: number
): UsePaginationReturn => {
    // Calculate pagination
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = projects.slice(
        indexOfFirstProject,
        indexOfLastProject
    );
    const totalPages = Math.ceil(projects.length / projectsPerPage);

    return {
        currentProjects,
        totalPages,
        indexOfFirstProject,
        indexOfLastProject,
    };
};
