"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}): React.JSX.Element | null => {
    if (totalPages <= 1) return null;

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
            pages.push("...");
        }

        // Show pages around current
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push("...");
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center mt-8">
            <div className="inline-flex items-center gap-1 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                        currentPage === 1
                            ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    }`}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 px-1">
                    {pageNumbers.map((page, index) =>
                        page === "..." ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm"
                            >
                                •••
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                    currentPage === page
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-200 dark:shadow-none"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                                }`}
                            >
                                {page}
                            </button>
                        ),
                    )}
                </div>

                {/* Next Button */}
                <button
                    onClick={() =>
                        onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                        currentPage === totalPages
                            ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    }`}
                    aria-label="Next page"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
