'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessDeniedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Start the countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect after 4 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 4000);

    // Cleanup timers on component unmount
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      {/* Updated card size to max-w-2xl for a larger appearance */}
      <div className="card w-full max-w-2xl shadow-2xl bg-white border border-base-300 animate-fade-in">
        <div className="card-body items-center text-center">
          <div className="alert alert-error shadow-sm w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-8 w-8"
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
            <span className="text-xl font-medium">
              การเข้าถึงถูกปฏิเสธ!
            </span>
          </div>

          <h2 className="text-3xl font-semibold mt-4 text-red-600">
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้ ติดต่อแอดมินเพื่อเข้าใช้งาน
          </h2>

          <p className="text-xl text-base-content mt-2">
            กำลังนำคุณกลับไปยังหน้าหลักใน {countdown} วินาที...
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