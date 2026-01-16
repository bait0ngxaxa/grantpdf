import React, { useState } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Project } from "@/type";

import { ProjectsListHeader } from "./ProjectsListHeader";
import { ProjectItem } from "./ProjectItem";
import { EmptyProjectsState } from "./EmptyProjectsState";
import { StatusDetailModal } from "./StatusDetailModal";

interface ProjectsListProps {
    projects: Project[];
    totalProjects: number;
    expandedProjects: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;
    handleEditProject: (project: Project) => void;
    handleDeleteProject: (projectId: string) => void;
    openPreviewModal: (url: string, title: string) => void;
    handleDeleteFile: (fileId: string) => void;
    setShowCreateProjectModal: (show: boolean) => void;
    router: AppRouterInstance;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
    projects,
    totalProjects,
    expandedProjects,
    toggleProjectExpansion,
    handleEditProject,
    handleDeleteProject,
    openPreviewModal,
    handleDeleteFile,
    setShowCreateProjectModal,
    router,
}): React.JSX.Element => {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatusProject, setSelectedStatusProject] =
        useState<Project | null>(null);

    // Track which status notes have been viewed (stored in localStorage)
    const [viewedStatusNotes, setViewedStatusNotes] = useState<Set<string>>(
        () => {
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("viewedStatusNotes");
                return saved ? new Set(JSON.parse(saved)) : new Set();
            }
            return new Set();
        }
    );

    // Check if project has unread status note
    const hasUnreadStatusNote = (project: Project): boolean => {
        if (!project.statusNote) return false;
        const noteKey = `${project.id}_${project.updated_at}`;
        return !viewedStatusNotes.has(noteKey);
    };

    const openStatusDetailModal = (
        project: Project,
        e: React.MouseEvent
    ): void => {
        e.stopPropagation();
        setSelectedStatusProject(project);
        setShowStatusModal(true);

        // Mark this status note as read
        if (project.statusNote) {
            const noteKey = `${project.id}_${project.updated_at}`;
            const newViewed = new Set(viewedStatusNotes);
            newViewed.add(noteKey);
            setViewedStatusNotes(newViewed);
            localStorage.setItem(
                "viewedStatusNotes",
                JSON.stringify([...newViewed])
            );
        }
    };

    const closeStatusDetailModal = (): void => {
        setShowStatusModal(false);
        setSelectedStatusProject(null);
    };

    return (
        <div className="animate-fade-in-up">
            <ProjectsListHeader
                totalProjects={totalProjects}
                onCreateProject={() => setShowCreateProjectModal(true)}
            />

            <div className="space-y-6">
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <ProjectItem
                            key={project.id}
                            project={project}
                            isExpanded={expandedProjects.has(project.id)}
                            hasUnreadStatusNote={hasUnreadStatusNote(project)}
                            onToggleExpand={() =>
                                toggleProjectExpansion(project.id)
                            }
                            onEditProject={() => handleEditProject(project)}
                            onDeleteProject={() =>
                                handleDeleteProject(project.id)
                            }
                            onStatusClick={(e) =>
                                openStatusDetailModal(project, e)
                            }
                            openPreviewModal={openPreviewModal}
                            handleDeleteFile={handleDeleteFile}
                            router={router}
                        />
                    ))
                ) : (
                    <EmptyProjectsState
                        onCreateProject={() => setShowCreateProjectModal(true)}
                    />
                )}
            </div>

            <StatusDetailModal
                isOpen={showStatusModal}
                project={selectedStatusProject}
                onClose={closeStatusDetailModal}
            />
        </div>
    );
};
