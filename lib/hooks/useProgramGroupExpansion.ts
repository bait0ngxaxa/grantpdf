import { useCallback, useState } from "react";

export interface ProgramGroupExpansionState {
    expandedGroups: Set<string>;
    toggleGroup: (groupKey: string) => void;
    expandGroup: (groupKey: string) => void;
}

export function useProgramGroupExpansion(): ProgramGroupExpansionState {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        new Set(),
    );

    const toggleGroup = useCallback((groupKey: string): void => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupKey)) {
                next.delete(groupKey);
            } else {
                next.add(groupKey);
            }
            return next;
        });
    }, []);

    const expandGroup = useCallback((groupKey: string): void => {
        setExpandedGroups((prev) => {
            if (prev.has(groupKey)) return prev;

            const next = new Set(prev);
            next.add(groupKey);
            return next;
        });
    }, []);

    return { expandedGroups, toggleGroup, expandGroup };
}
