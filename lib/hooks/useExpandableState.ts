import { useState, useCallback } from "react";

export function useExpandableState(): {
    expandedProjects: Set<string>;
    expandedRows: Set<string>;
    toggleProjectExpansion: (projectId: string) => void;
    toggleRowExpansion: (fileId: string) => void;
} {
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
        new Set()
    );
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleProjectExpansion = useCallback((projectId: string) => {
        setExpandedProjects((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    }, []);

    const toggleRowExpansion = useCallback((fileId: string) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(fileId)) {
                newSet.delete(fileId);
            } else {
                newSet.add(fileId);
            }
            return newSet;
        });
    }, []);

    return {
        expandedProjects,
        expandedRows,
        toggleProjectExpansion,
        toggleRowExpansion,
    };
}
