import { useState } from 'react';

interface PdfFile {
  id: string;
  fileName: string;
  createdAt: string;
  lastModified: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  pdfUrl?: string;
  originalFileName: string;
  storagePath: string;
  created_at: string;
  updated_at: string;
  fileExtension: string;
  downloadStatus: string;
  downloadedAt?: string;
  attachmentFiles?: AttachmentFile[];
}

interface AttachmentFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  userId: string;
  userName: string;
  userEmail: string;
  files: PdfFile[];
  _count: {
    files: number;
  };
}

interface ProjectsResponse {
  projects: Project[];
  orphanFiles: PdfFile[];
}

export const useAdminData = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [orphanFiles, setOrphanFiles] = useState<PdfFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [latestUser, setLatestUser] = useState<{
    name: string;
    email: string;
    created_at: string;
  } | null>(null);
  const [todayProjects, setTodayProjects] = useState(0);
  const [todayFiles, setTodayFiles] = useState(0);

  // Fetch latest user data
  const fetchLatestUser = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          const latest = data.users[0];
          setLatestUser({
            name: latest.name,
            email: latest.email,
            created_at: latest.created_at,
          });
        } else {
          setLatestUser(null);
        }
      }
    } catch (error) {
      console.error("Error fetching latest user:", error);
      setLatestUser(null);
    }
  };

  // Fetch projects data
  const fetchProjects = async (session: any) => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProjectsResponse = await response.json();
      console.log("Admin Projects API response:", data);

      setProjects(data.projects);
      setOrphanFiles(data.orphanFiles);

      // Calculate total users from projects
      const uniqueUserIds = new Set(data.projects.map((p) => p.userId));
      setTotalUsers(uniqueUserIds.size);

      // Fetch latest user data
      await fetchLatestUser();

      // Calculate files created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const allFiles = [
        ...data.orphanFiles,
        ...data.projects.flatMap((p) => p.files),
      ];
      const todayFilesCount = allFiles.filter((file) => {
        const fileDate = new Date(file.created_at);
        return fileDate >= today && fileDate < tomorrow;
      }).length;

      // Calculate projects created today
      const todayProjectsCount = data.projects.filter((project) => {
        const projectDate = new Date(project.created_at);
        return projectDate >= today && projectDate < tomorrow;
      }).length;

      setTodayProjects(todayProjectsCount);
      setTodayFiles(todayFilesCount);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    setProjects,
    orphanFiles,
    setOrphanFiles,
    isLoading,
    error,
    totalUsers,
    latestUser,
    todayProjects,
    todayFiles,
    fetchProjects,
  };
};