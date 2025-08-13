'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

// Define the type for the form data
interface WordDocumentData {
  head: string;
  topic: string;
}

export default function TestWordWithSignaturePage() {
  const [formData, setFormData] = useState<WordDocumentData>({
    head: '',
    topic: '',
  });
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  // Handles changes to text inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles file input changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSignatureFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSignaturePreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setGeneratedFileUrl(null);
    setIsError(false);

    if (!signatureFile) {
      setMessage('กรุณาอัปโหลดไฟล์ลายเซ็นก่อน');
      setIsSubmitting(false);
      setIsError(true);
      return;
    }

    try {
      // Use FormData to send both text data and the file
      const data = new FormData();
      data.append('head', formData.head);
      data.append('topic', formData.topic);
      data.append('signatureFile', signatureFile);

      // Fetch the Word document from the new API route
      const response = await fetch('/api/fill-word-template', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        // Since the API returns a file blob directly, not a JSON object
        const blob = await response.blob();
        
        // Create a temporary URL for the blob to allow download
        const url = URL.createObjectURL(blob);
        setGeneratedFileUrl(url);
        setMessage('สร้างเอกสาร Word สำเร็จแล้ว!');
        setIsError(false);
      } else {
        // If the response is not OK, parse the error message from the text
        const errorText = await response.text();
        setMessage(`เกิดข้อผิดพลาด: ${errorText || 'ไม่สามารถสร้างเอกสาร Word ได้'}`);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4 font-sans antialiased">
      <div className="navbar bg-base-100 rounded-box shadow-lg mb-6 w-full max-w-2xl">
        <div className="flex-1">
          <a href="/userdashboard" className="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="ml-2">กลับสู่แดชบอร์ด</span>
          </a>
        </div>
      </div>

      <div className="card w-full max-w-2xl shadow-xl bg-base-100 p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">สร้าง Word Document พร้อมลายเซ็น</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">หัวข้อหลัก (head)</span>
            </label>
            <input
              type="text"
              name="head"
              placeholder="หัวข้อหลัก"
              className="input input-bordered w-full"
              value={formData.head}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">หัวข้อย่อย (topic)</span>
            </label>
            <textarea
              name="topic"
              placeholder="หัวข้อย่อย"
              className="textarea textarea-bordered h-24 w-full"
              value={formData.topic}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">อัปโหลดลายเซ็น (.png)</span>
            </label>
            <input
              type="file"
              name="signatureFile"
              className="file-input file-input-bordered w-full"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              required
            />
          </div>
          
          {signaturePreview && (
            <div className="flex justify-center mt-4 p-4 border border-dashed rounded-md bg-base-200">
              <img src={signaturePreview} alt="Signature Preview" className="max-w-xs h-auto object-contain" />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                กำลังสร้าง Word...
              </>
            ) : (
              'สร้าง Word พร้อมลายเซ็น'
            )}
          </button>
        </form>

        {message && (
          <div className={`alert ${isError ? 'alert-error' : 'alert-success'} mt-6`}>
            <span>{message}</span>
          </div>
        )}

        {generatedFileUrl && (
          <div className="mt-6 text-center">
            <p className="mb-2">เอกสาร Word ของคุณพร้อมแล้ว:</p>
            <a
              href={generatedFileUrl}
              download="output-with-signature.docx"
              rel="noopener noreferrer"
              className="btn btn-info"
            >
              ดาวน์โหลด Word
            </a>
          </div>
        )}
      </div>
    </div>
  );
}