// /app/test-pdf-fill/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

// Define the type for the form data
interface TestTorsData {
  projectName: string;
  clientName: string;
  description: string; // Generic description field
}

export default function TestPdfFillPage() {
  const [formData, setFormData] = useState<TestTorsData>({
    projectName: '',
    clientName: '',
    description: '',
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
      const response = await fetch('/api/fill-pdf-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPdfUrl(data.pdfUrl);
        setMessage('สร้างเอกสาร PDF สำเร็จแล้ว!');
        setIsError(false);
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
            <a
              href={generatedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-info mr-2"
            >
              พรีวิว / ดาวน์โหลด PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}