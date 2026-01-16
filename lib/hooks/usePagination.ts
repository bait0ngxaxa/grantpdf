import { useState, useMemo, useCallback } from "react";

interface UsePaginationProps<T> {
    items: T[];
    itemsPerPage?: number;
}

export function usePagination<T>({
    items,
    itemsPerPage = 10,
}: UsePaginationProps<T>): {
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    paginatedItems: T[];
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
    totalItems: number;
    goToPage: (page: number) => void;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    resetPage: () => void;
} {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    // Compute effective current page (auto-adjust if out of range)
    const effectiveCurrentPage = useMemo(() => {
        if (totalPages === 0) return 1;
        if (currentPage > totalPages) return totalPages;
        return currentPage;
    }, [currentPage, totalPages]);

    const paginatedItems = useMemo(() => {
        const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, effectiveCurrentPage, itemsPerPage]);

    const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);

    const goToPage = useCallback(
        (page: number) => {
            const maxPage = Math.max(1, Math.ceil(items.length / itemsPerPage));
            const validPage = Math.max(1, Math.min(page, maxPage));
            setCurrentPage(validPage);
        },
        [items.length, itemsPerPage]
    );

    const goToNextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1));
    }, [totalPages]);

    const goToPreviousPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }, []);

    const resetPage = useCallback(() => setCurrentPage(1), []);

    return {
        currentPage: effectiveCurrentPage,
        setCurrentPage,
        totalPages,
        paginatedItems,
        itemsPerPage,
        startIndex,
        endIndex,
        totalItems: items.length,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        resetPage,
    };
}
