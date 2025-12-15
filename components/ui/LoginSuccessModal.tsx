"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface LoginSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  autoCloseDelay?: number; // เวลาในการปิดอัตโนมัติ (มิลลิวินาที)
}

export const LoginSuccessModal: React.FC<LoginSuccessModalProps> = ({
  isOpen,
  onClose,
  email,
  autoCloseDelay = 3000 // default 3 วินาที
}) => {
  const router = useRouter();

  const handleGoToDashboard = () => {
    onClose();
    router.push('/userdashboard');
  };

  // Auto-close modal หลังจากเวลาที่กำหนด
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleGoToDashboard();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay]);

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-white dark:bg-gray-800 max-w-md transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100 dark:bg-green-900/20 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          {/* Success Message */}
          <h3 className="font-bold text-lg mb-2 text-green-600">
            เข้าสู่ระบบสำเร็จ!
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            ยินดีต้อนรับเข้าสู่ระบบ
          </p>
          {email && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {email}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            กำลังนำทางไปยังหน้าหลักอัตโนมัติ...
          </p>
          
          {/* Action Button */}
          <div className="flex flex-col space-y-2 w-full">
            <Button
              onClick={handleGoToDashboard}
              className="w-full bg-primary hover:bg-primary/90 text-white transform transition-all duration-200 hover:scale-105"
            >
              ไปยังหน้าหลัก
            </Button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>ปิด</button>
      </form>
    </dialog>
  );
};