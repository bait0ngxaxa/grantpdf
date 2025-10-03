export interface UsePaginationReturn {
  currentProjects: any[];
  totalPages: number;
  indexOfFirstProject: number;
  indexOfLastProject: number;
}

export const usePagination = (
  projects: any[],
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