// /app/upload-test/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function UploadTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadMessage(null); // Clear previous messages
      setIsError(false);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadMessage('กรุณาเลือกไฟล์ก่อนอัปโหลด');
      setIsError(true);
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);
    setIsError(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadMessage(`อัปโหลดสำเร็จ! URL: ${data.fileUrl}`);
        setIsError(false);
        setSelectedFile(null); // Clear selected file after successful upload
        // Optionally, reset the file input visually
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await response.json();
        setUploadMessage(`อัปโหลดล้มเหลว: ${errorData.error || 'เกิดข้อผิดพลาดที่ไม่รู้จัก'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      setUploadMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <div className="navbar bg-base-100 rounded-box shadow-lg mb-6 w-full max-w-2xl">
        <div className="flex-1">
          <Link href="/dashboard" className="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="ml-2">กลับสู่แดชบอร์ด</span>
          </Link>
        </div>
      </div>

      <div className="card w-full max-w-2xl shadow-xl bg-base-100 p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">ทดสอบอัปโหลดไฟล์ไป Supabase Storage</h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">เลือกไฟล์</span>
            </label>
            <input
              id="file-input"
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={handleFileChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner"></span>
                กำลังอัปโหลด...
              </>
            ) : (
              'อัปโหลดไฟล์'
            )}
          </button>
        </form>

        {uploadMessage && (
          <div className={`alert ${isError ? 'alert-error' : 'alert-success'} mt-6`}>
            <span>{uploadMessage}</span>
          </div>
        )}

        {selectedFile && !uploadMessage && (
          <div className="mt-4 text-sm text-gray-600">
            <p>ไฟล์ที่เลือก: {selectedFile.name}</p>
            <p>ขนาด: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>
    </div>
  );
}