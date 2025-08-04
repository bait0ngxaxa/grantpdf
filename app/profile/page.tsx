// /app/profile/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  // Use the useSession hook to get session data and status
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the session status is "unauthenticated", redirect to the sign-in page
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Show a loading message while the session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-medium text-gray-700">Loading...</p>
      </div>
    );
  }

  // If the user is authenticated, display their information
  if (status === 'authenticated' && session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">ข้อมูลผู้ใช้</h1>
          <p className="text-gray-600 mb-2">
            **ชื่อ:**{' '}
            <span className="font-semibold text-gray-800">
              {session.user?.name || 'ไม่ได้ระบุ'}
            </span>
          </p>
          <p className="text-gray-600 mb-2">
            **Role:**{' '}
            <span className="font-semibold text-gray-800">
              {session.user?.role || 'ไม่ได้ระบุ'}
            </span>
          </p>
          <p className="text-gray-600 mb-4">
            **สถานะ:**{' '}
            <span className="font-semibold text-green-600">เข้าสู่ระบบแล้ว</span>
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  // If the user is unauthenticated, a redirect has already been triggered by useEffect
  return null;
}