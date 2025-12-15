"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "loading" | "error" | "no-projects";
  error?: string;
}

export const EmptyState = ({ type, error }: EmptyStateProps) => {
  const router = useRouter();

  if (type === "loading") {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-4">กำลังโหลดโครงการ...</span>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button
          onClick={() => router.push("/userdashboard")}
          className="mt-4"
        >
          กลับไปแดชบอร์ด
        </Button>
      </div>
    );
  }

  if (type === "no-projects") {
    return (
      <div className="text-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-24 w-24 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          ยังไม่มีโครงการ
        </h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          กรุณาสร้างโครงการก่อนสร้างเอกสาร
        </p>
        <div className="mt-6">
          <Button onClick={() => router.push("/userdashboard")}>
            สร้างโครงการใหม่
          </Button>
        </div>
      </div>
    );
  }

  return null;
};