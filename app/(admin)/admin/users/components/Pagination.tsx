import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    if (totalPages <= 1) return null;

    const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1));
    const goToNextPage = () =>
        onPageChange(Math.min(totalPages, currentPage + 1));

    const getPageNumbers = (): (number | string)[] => {
        const pageNumbers: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push("...");
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push("...");
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                        แสดง {startItem} - {endItem} จาก {totalItems} รายการ
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                            currentPage === 1
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
                        }`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((pageNum, index) =>
                        pageNum === "..." ? (
                            <span
                                key={index}
                                className="px-3 py-2 text-gray-500 dark:text-gray-400"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={index}
                                onClick={() => onPageChange(pageNum as number)}
                                className={`px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                                    currentPage === pageNum
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                                }`}
                            >
                                {pageNum}
                            </button>
                        )
                    )}

                    {/* Next Button */}
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                            currentPage === totalPages
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
                        }`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
