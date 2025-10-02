'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CreateDocSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  downloadUrl: string | null;
  documentType?: string;
}

export const CreateDocSuccessModal: React.FC<CreateDocSuccessModalProps> = ({
  isOpen,
  onClose,
  fileName,
  downloadUrl,
  documentType = "เอกสาร"
}) => {
  const router = useRouter();

  const downloadFileName = (() => {
    // ถ้า fileName เป็นค่าว่าง ให้ใช้ชื่อ default
    if (!fileName || fileName.trim() === '') {
      if (documentType?.includes('Excel')) {
        return 'document.xlsx';
      } else {
        return 'document.docx';
      }
    }
    
    if (fileName.includes('.')) {
      return fileName; // ถ้ามี extension อยู่แล้ว ใช้ตามที่ระบุ
    }
    
    // ถ้าไม่มี extension ให้ใส่ตามประเภทเอกสาร
    if (documentType?.includes('Excel')) {
      return `${fileName}.xlsx`;
    } else {
      return `${fileName}.docx`; // default เป็น .docx สำหรับ Word documents
    }
  })();

  const handleBackToDashboard = () => {
    onClose();
    router.push('/userdashboard');
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100 dark:bg-green-900/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
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
          <h3 className="font-bold text-lg mb-2 text-green-600">
            สร้าง{documentType}สำเร็จ!
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {documentType}ของคุณพร้อมแล้ว
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            ไฟล์: {downloadFileName}
          </p>
          
          <div className="flex flex-col space-y-2 w-full">
            <Button
              onClick={handleBackToDashboard}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white"
            >
              กลับไปหน้าหลัก
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