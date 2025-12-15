import { useEffect } from "react";
import { useSession } from "next-auth/react";

export interface UseProjectDataReturn {
  fetchProjects: () => Promise<void>;
}

export const useProjectData = (
  setProjects: (projects: any[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setSelectedProjectId: (id: string | null) => void
): UseProjectDataReturn => {
  const { status } = useSession();

  const fetchProjects = async () => {
    if (status !== "authenticated") return;

    try {
      const res = await fetch("/api/projects");
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await res.json();
      setProjects(data.projects);

      // Check if there's a selected project from localStorage
      const storedProjectId = localStorage.getItem("selectedProjectId");
      if (
        storedProjectId &&
        data.projects.some((p: any) => p.id === storedProjectId)
      ) {
        setSelectedProjectId(storedProjectId);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("ไม่สามารถโหลดโครงการได้");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects when component mounts and status changes
  useEffect(() => {
    fetchProjects();
  }, [status]);

  return {
    fetchProjects,
  };
};