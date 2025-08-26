'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AccessDeniedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Start the countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect after 6 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 6000);

    // Cleanup timers on component unmount
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.04] bg-[size:60px_60px]"></div>
      
      {/* Main Content */}
      <div className="relative w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">การเข้าถึงถูกปฏิเสธ</h1>
            <p className="text-red-100 text-center text-lg">Access Denied</p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 text-center">
            {/* Alert Message */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-3">
                คุณไม่มีสิทธิ์เข้าถึงหน้านี้
              </h2>
              <p className="text-red-700 dark:text-red-300 leading-relaxed">
                หน้านี้เป็นพื้นที่สำหรับผู้ดูแลระบบเท่านั้น<br />
                กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์การเข้าถึง
              </p>
            </div>

            {/* Countdown */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  กำลังนำคุณกลับไปยังหน้าหลัก
                </span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">{countdown}</span>
                </div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">วินาที</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/')}
                className="bg-primary hover:bg-primary-focus text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                กลับหน้าหลัก
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/signin')}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-full text-lg font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                เข้าสู่ระบบ
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>คำแนะนำ:</strong> หากคุณเป็นผู้ดูแลระบบ กรุณาลงชื่อเข้าใช้ด้วยบัญชีที่มีสิทธิ์ admin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-red-200 dark:bg-red-800 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/20 rounded-full opacity-30 animate-bounce delay-1000"></div>
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-secondary/20 rounded-full opacity-25 animate-pulse delay-500"></div>
    </div>
  );
}