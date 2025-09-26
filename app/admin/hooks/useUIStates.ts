import { useState, useEffect } from 'react';

export const useUIStates = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [viewedProjects, setViewedProjects] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAtDesc");
  const [selectedFileType, setSelectedFileType] = useState("ไฟล์ทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState("สถานะทั้งหมด");

  // Load viewed projects from localStorage on component mount
  useEffect(() => {
    const storedViewedProjects = localStorage.getItem("viewedProjects");
    if (storedViewedProjects) {
      try {
        const viewedProjectIds = JSON.parse(storedViewedProjects);
        setViewedProjects(new Set(viewedProjectIds));
      } catch (error) {
        console.error("Error loading viewed projects:", error);
      }
    }
  }, []);

  // Toggle project expansion
  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
        // Mark project as viewed when expanded
        setViewedProjects((prevViewed) => {
          const newViewedSet = new Set(prevViewed);
          newViewedSet.add(projectId);
          // Store in localStorage to persist across sessions
          localStorage.setItem(
            "viewedProjects",
            JSON.stringify([...newViewedSet])
          );
          return newViewedSet;
        });
      }
      return newSet;
    });
  };

  // Toggle row expansion
  const toggleRowExpansion = (fileId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  return {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    expandedProjects,
    viewedProjects,
    expandedRows,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedFileType,
    setSelectedFileType,
    selectedStatus,
    setSelectedStatus,
    toggleProjectExpansion,
    toggleRowExpansion,
  };
};