import { useState, useMemo, useCallback } from "react";

interface UsePaginationOptions {
    itemsPerPage?: number;
}

export function usePagination<T>(
    items: T[],
    options: UsePaginationOptions = {}
) {
    const { itemsPerPage = 10 } = options;
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
        totalPages,
        paginatedItems,
        itemsPerPage,
        totalItems: items.length,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        resetPage,
    };
}
