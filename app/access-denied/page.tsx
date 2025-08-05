'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessDeniedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-lg shadow-2xl bg-white border border-base-300 animate-fade-in">
        <div className="card-body items-center text-center">
          <div className="alert alert-error shadow-sm w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
              />
            </svg>
            <span className="text-lg font-medium">
              การเข้าถึงถูกปฏิเสธ!
            </span>
          </div>

          <h2 className="text-2xl font-semibold mt-4 text-red-600">
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </h2>

          <p className="text-base-content text-sm mt-2">
            กำลังนำคุณกลับไปยังหน้าหลักใน 3 วินาที...
          </p>

          <button
            className="btn btn-outline btn-error mt-6"
            onClick={() => router.push('/')}
          >
            กลับหน้าหลักทันที
          </button>
        </div>
      </div>
    </div>
  );
}
