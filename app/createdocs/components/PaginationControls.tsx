"use client";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls = ({ currentPage, totalPages, onPageChange }: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`btn btn-sm ${
          currentPage === 1
            ? "btn-disabled"
            : "btn-outline hover:btn-primary"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        ก่อนหน้า
      </button>

      <div className="flex items-center space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`btn btn-sm ${
                currentPage === page
                  ? "btn-primary"
                  : "btn-outline hover:btn-primary"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() =>
          onPageChange(Math.min(currentPage + 1, totalPages))
        }
        disabled={currentPage === totalPages}
        className={`btn btn-sm ${
          currentPage === totalPages
            ? "btn-disabled"
            : "btn-outline hover:btn-primary"
        }`}
      >
        ถัดไป
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};