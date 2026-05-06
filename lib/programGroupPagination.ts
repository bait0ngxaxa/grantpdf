export interface PaginatedGroupItems<T> {
    currentPage: number;
    totalPages: number;
    items: T[];
}

export function paginateGroupItems<T>(
    items: T[],
    requestedPage: number | undefined,
    itemsPerPage: number,
): PaginatedGroupItems<T> {
    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    const currentPage = Math.min(Math.max(requestedPage ?? 1, 1), totalPages);
    const startIndex = (currentPage - 1) * itemsPerPage;

    return {
        currentPage,
        totalPages,
        items: items.slice(startIndex, startIndex + itemsPerPage),
    };
}
