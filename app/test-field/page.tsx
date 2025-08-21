// /app/test-pdf-fill/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

// Define the type for the form data
interface TestTorsData {
  projectName: string;
  clientName: string;
  description: string;
  userId: string; // เพิ่ม userId field
}

export default function TestPdfFillPage() {
  const [formData, setFormData] = useState<TestTorsData>({
    projectName: '',
    clientName: '',
    description: '',
    userId: '1', // ค่าเริ่มต้น หรือจะดึงจาก session/auth ก็ได้
  });
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setGeneratedPdfUrl(null);
    setIsError(false);

    try {
      // แปลง userId เป็น number ก่อนส่ง
      const submitData = {
        ...formData,
        userId: parseInt(formData.userId),
      };

      const response = await fetch('/api/fill-pdf-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPdfUrl(data.pdfUrl);
        setMessage(`สร้างเอกสาร PDF สำเร็จแล้ว! (ID: ${data.fileRecord?.id})`);
        setIsError(false);
        
        // Reset form หลังสร้างสำเร็จ
        setFormData({
          projectName: '',
          clientName: '',
          description: '',
          userId: formData.userId, // เก็บ userId เดิมไว้
        });
      } else {
        const errorData = await response.json();
        setMessage(`เกิดข้อผิดพลาด: ${errorData.error || 'ไม่สามารถสร้างเอกสาร PDF ได้'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
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
        <h2 className="text-2xl font-semibold text-center mb-6">ทดสอบกรอกข้อมูลลง PDF Template</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">User ID</span>
            </label>
            <input
              type="number"
              name="userId"
              placeholder="User ID"
              className="input input-bordered w-full"
              value={formData.userId}
              onChange={handleChange}
              required
              min="1"
            />
            <div className="label">
              <span className="label-text-alt">ระบุ ID ของผู้ใช้ (สำหรับทดสอบ)</span>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">ชื่อโครงการ</span>
            </label>
            <input
              type="text"
              name="projectName"
              placeholder="ชื่อโครงการ"
              className="input input-bordered w-full"
              value={formData.projectName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">ชื่อลูกค้า</span>
            </label>
            <input
              type="text"
              name="clientName"
              placeholder="ชื่อลูกค้า"
              className="input input-bordered w-full"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">รายละเอียด</span>
            </label>
            <textarea
              name="description"
              placeholder="รายละเอียดโครงการ"
              className="textarea textarea-bordered h-24 w-full"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                กำลังสร้าง PDF...
              </>
            ) : (
              'สร้าง PDF'
            )}
          </button>
        </form>

        {message && (
          <div className={`alert ${isError ? 'alert-error' : 'alert-success'} mt-6`}>
            <span>{message}</span>
          </div>
        )}

        {generatedPdfUrl && (
          <div className="mt-6 text-center">
            <p className="mb-2">เอกสาร PDF ของคุณพร้อมแล้ว:</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href={generatedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-info"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                พรีวิว PDF
              </a>
              <a
                href={generatedPdfUrl}
                download
                className="btn btn-success"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                ดาวน์โหลด PDF
              </a>
            </div>
            <p className="text-sm text-base-content/60 mt-2">
              ไฟล์ถูกบันทึกที่: {generatedPdfUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}