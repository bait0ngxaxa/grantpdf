"use client";

import { useRouter } from "next/navigation";

interface MainMenuProps {
  isAdmin: boolean;
  selectedProjectId: string | null;
  onCategorySelect: (category: string) => void;
  onSummarySelect: (templateId: string, title: string) => void;
}

export const MainMenu = ({ isAdmin, selectedProjectId, onCategorySelect, onSummarySelect }: MainMenuProps) => {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-5xl bg-base-100 p-8 rounded-xl shadow-xl flex-grow flex flex-col justify-center">
      <h1 className="text-3xl font-bold text-center mb-8">สร้างเอกสาร</h1>

      <div className={`${isAdmin ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'flex justify-center'}`}>
        {/* สัญญาจ้างทั่วไป Card - แสดงเฉพาะแอดมิน */}
        {isAdmin && (
          <div
            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
            onClick={() => onCategorySelect("general")}
          >
            <div className="card-body items-center text-center p-8">
              <div className="flex items-center justify-center p-6 rounded-full bg-primary/10 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="card-title text-2xl mb-4">
                เอกสารสัญญาจ้างทั่วไป
              </h2>
              <p className="text-lg text-base-content/60">
                สำหรับการจ้างงานทั่วไป
              </p>
              <div className="mt-4">
                <div className="badge badge-outline badge-lg">2 เอกสาร</div>
              </div>
            </div>
          </div>
        )}

        {/* แบบสรุปโครงการ Card - แสดงเฉพาะแอดมิน */}
        {isAdmin && (
          <div
            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary"
            onClick={() => onSummarySelect("project-summary", "แบบสรุปโครงการ")}
          >
            <div className="card-body items-center text-center p-8">
              <div className="flex items-center justify-center p-6 rounded-full bg-amber-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="card-title text-2xl mb-4">
                แบบสรุปโครงการ
              </h2>
              <p className="text-lg text-base-content/60">
                สำหรับสรุปผลการดำเนินโครงการ
              </p>
              <div className="mt-4">
                <div className="badge badge-outline badge-lg">1 เอกสาร</div>
              </div>
            </div>
          </div>
        )}

        {/* ยื่นโครงการ Card - แสดงสำหรับทุกคน */}
        <div
          className={`card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-all duration-200 border-2 border-transparent hover:border-primary ${
            !isAdmin ? 'w-full max-w-lg' : ''
          }`}
          onClick={() => onCategorySelect("project")}
        >
          <div className="card-body items-center text-center p-8">
            <div className="flex items-center justify-center p-6 rounded-full bg-pink-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="card-title text-2xl mb-4">เอกสารยื่นโครงการ</h2>
            <p className="text-lg text-base-content/60">สำหรับการยื่นโครงการ</p>
            <div className="mt-4">
              <div className="badge badge-outline badge-lg">3 เอกสาร</div>
            </div>
          </div>
        </div>
      </div>

      {selectedProjectId && (
        <div className="text-center mt-8">
          <p className="text-lg text-base-content/70">
            หรือ
            <button
              onClick={() => {
                localStorage.setItem("selectedProjectId", selectedProjectId);
                router.push("/uploads-doc");
              }}
              className="text-primary hover:text-primary-focus underline cursor-pointer font-semibold transition-colors"
            >
              อัพโหลดเอกสาร
            </button>
          </p>
        </div>
      )}
    </div>
  );
};