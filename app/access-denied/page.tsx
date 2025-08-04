// /app/access-denied/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessDeniedPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the home page after 3 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          การเข้าถึงถูกปฏิเสธ
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        </p>
        <p className="text-gray-500">
          กำลังนำคุณกลับไปยังหน้าหลัก...
        </p>
      </div>
    </div>
  );
}