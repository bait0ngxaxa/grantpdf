'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, FormEvent } from 'react';

// Define the type for the form data to ensure type safety
interface TorsData {
  projectName: string;
  clientName: string;
  projectDescription: string;
  scopeOfWork: string;
  startDate: string;
  endDate: string;
  budget: number;
  contactPerson: string;
}

export default function CreateTorsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TorsData>({
    projectName: '',
    clientName: '',
    projectDescription: '',
    scopeOfWork: '',
    startDate: '',
    endDate: '',
    budget: 0,
    contactPerson: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'budget' ? Number(value) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    // In a real application, you would send this data to your backend API.
    // For this example, we will simulate an API call with a timeout.
    try {
      console.log("Saving TORS data:", formData);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate a 2-second API call
      
      console.log("Data saved successfully!");
      
      // After saving, redirect to the dashboard
      router.push('/userdashboard');
    } catch (error) {
      console.error("Failed to save data:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6">
      {/* Header and Back button */}
      <div className="navbar bg-base-100 rounded-box shadow-lg mb-6">
        <div className="flex-1">
          <Link href="/userdashboard" className="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="ml-2">กลับสู่แดชบอร์ด</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl bg-base-100 p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-8">สร้างเอกสาร TORS</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-lg">ชื่อโครงการ</span>
            </label>
            <input
              type="text"
              name="projectName"
              placeholder="เช่น โครงการพัฒนาเว็บไซต์บริษัท"
              className="input input-bordered w-full text-lg"
              value={formData.projectName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Client Name */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-lg">ชื่อลูกค้า</span>
            </label>
            <input
              type="text"
              name="clientName"
              placeholder="เช่น บริษัท สยามเทค จำกัด"
              className="input input-bordered w-full text-lg"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Project Description */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-lg">รายละเอียดโครงการ</span>
            </label>
            <textarea
              name="projectDescription"
              placeholder="ระบุรายละเอียดโครงการโดยย่อ..."
              className="textarea textarea-bordered h-32 w-full text-lg"
              value={formData.projectDescription}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Scope of Work */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-lg">ขอบเขตของงาน (Scope of Work)</span>
            </label>
            <textarea
              name="scopeOfWork"
              placeholder="ระบุขอบเขตของงานและ deliverables..."
              className="textarea textarea-bordered h-40 w-full text-lg"
              value={formData.scopeOfWork}
              onChange={handleChange}
              required
            />
          </div>

          {/* Timeline and Budget Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg">วันเริ่มต้นโครงการ</span>
              </label>
              <input
                type="date"
                name="startDate"
                className="input input-bordered w-full text-lg"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg">วันสิ้นสุดโครงการ</span>
              </label>
              <input
                type="date"
                name="endDate"
                className="input input-bordered w-full text-lg"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg">งบประมาณ (บาท)</span>
              </label>
              <input
                type="number"
                name="budget"
                placeholder="เช่น 150000"
                className="input input-bordered w-full text-lg"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg">ผู้ประสานงาน</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                placeholder="เช่น คุณสมชาย รักดี"
                className="input input-bordered w-full text-lg"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button type="submit" className="btn btn-primary btn-lg w-full max-w-xs" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="loading loading-spinner"></span>
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึก'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}