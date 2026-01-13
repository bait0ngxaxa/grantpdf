import { useState, useMemo } from "react";

interface usePaginationProps<T> {
    items: T[];
    itemsPerPage: number;
}

export function usePagination<T>({
    items,
    itemsPerPage,
}: usePaginationProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);

    return {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems,
        startIndex,
        endIndex,
        totalItems: items.length,
    };
}
