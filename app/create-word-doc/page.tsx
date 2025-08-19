'use client';

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface WordDocumentData {
  head: string;
  fileName: string;
  date: string;
  topicdetail: string;
  todetail: string;
  attachmentdetail: string;
  detail: string;
  name: string;
  depart: string;
  coor: string;
  tel: string;
  email: string;
}

export default function TestWordWithSignaturePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<WordDocumentData>({
    head: "",
    fileName: "",
    date: "",
    topicdetail: "",
    todetail: "",
    attachmentdetail: "",
    detail: "",
    name: "",
    depart: "",
    coor: "",
    tel: "",
    email: "",
  });

  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

  const fixedValues = {
    topic: 'รายงานผลการปฏิบัติงาน',
    to: 'ผู้จัดการฝ่ายบริหาร',
    attachment: 'เอกสารแนบตามที่ระบุ',
    regard: 'ขอแสดงความนับถืออย่างสูง',
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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

    if (!session) {
      setMessage("คุณต้องเข้าสู่ระบบก่อน");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setGeneratedFileUrl(null);
    setIsError(false);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key as keyof WordDocumentData]);
      });
      Object.keys(fixedValues).forEach((key) => {
        data.append(key, fixedValues[key as keyof typeof fixedValues]);
      });
      if (signatureFile) {
        data.append("signatureFile", signatureFile);
      }

      if (session.user?.id) {
        data.append("userId", session.user.id.toString());
      }
      if (session.user?.email) {
        data.append("userEmail", session.user.email);
      }
      if ((session as any)?.accessToken) {
        data.append("token", (session as any).accessToken);
      }

      const response = await fetch("/api/fill-word-template", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedFileUrl(url);
        setMessage("สร้างเอกสาร Word สำเร็จแล้ว!");
        setIsError(false);

        setTimeout(() => {
          router.push('/userdashboard');
        }, 2000);
      } else {
        const errorText = await response.text();
        setMessage(`เกิดข้อผิดพลาด: ${errorText || "ไม่สามารถสร้างเอกสาร Word ได้"}`);
        setIsError(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadFileName = formData.fileName.endsWith('.docx') ? formData.fileName : `${formData.fileName}.docx`;

  return (
    <div className="min-h-screen flex flex-col items-center bg-base-200 p-4 font-sans antialiased">
      <div className="navbar bg-base-100 rounded-box shadow-lg mb-6 w-full max-w-4xl">
        <div className="flex-1">
          <a href="/userdashboard" className="btn btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="ml-2">กลับสู่แดชบอร์ด</span>
          </a>
        </div>
      </div>

      <div className="card w-full max-w-4xl shadow-xl bg-base-100 p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">
          สร้าง Word Document
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  ชื่อโครงการ (filename)
                </span>
              </label>
              <input
                type="text"
                name="fileName"
                placeholder="ชื่อไฟล์ (ไม่จำเป็นต้องมี .docx)"
                className="input input-bordered w-full"
                value={formData.fileName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  เลขที่หนังสือ (head)
                </span>
              </label>
              <input
                type="text"
                name="head"
                placeholder="เลขที่หนังสือ"
                className="input input-bordered w-full"
                value={formData.head}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  วันที่ (date)
                </span>
              </label>
              <input
                type="text"
                name="date"
                placeholder="เช่น 14 สิงหาคม 2568"
                className="input input-bordered w-full"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                เรื่อง (topicdetail)
              </span>
            </label>
            <input
              type="text"
              name="topicdetail"
              placeholder="รายละเอียดหัวข้อ"
              className="input input-bordered w-full"
              value={formData.topicdetail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                ผู้รับ (todetail)
              </span>
            </label>
            <textarea
              name="todetail"
              placeholder="รายละเอียดผู้รับ"
              className="textarea textarea-bordered h-24 w-full"
              value={formData.todetail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                รายละเอียดสิ่งที่ส่งมาด้วย (attachmentdetail)
              </span>
            </label>
            <textarea
              name="attachmentdetail"
              placeholder="รายละเอียดสิ่งที่ส่งมาด้วย"
              className="textarea textarea-bordered h-24 w-full"
              value={formData.attachmentdetail}
              onChange={handleChange}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                เนื้อหา (detail)
              </span>
            </label>
            <textarea
              name="detail"
              placeholder="รายละเอียดเนื้อหา"
              className="textarea textarea-bordered h-24 w-full"
              value={formData.detail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  ชื่อผู้ลงนาม (name)
                </span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="ชื่อ-นามสกุล"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  ตำแหน่ง/แผนก (depart)
                </span>
              </label>
              <input
                type="text"
                name="depart"
                placeholder="ตำแหน่ง/แผนก"
                className="input input-bordered w-full"
                value={formData.depart}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  ผู้ประสานงาน (coor)
                </span>
              </label>
              <input
                type="text"
                name="coor"
                placeholder="ผู้ประสานงาน"
                className="input input-bordered w-full"
                value={formData.coor}
                onChange={handleChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  เบอร์โทรศัพท์ (tel)
                </span>
              </label>
              <input
                type="tel"
                name="tel"
                placeholder="เบอร์โทรศัพท์"
                className="input input-bordered w-full"
                value={formData.tel}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">อีเมล (email)</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="อีเมล"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                อัปโหลดลายเซ็น (.png)
              </span>
            </label>
            <input
              type="file"
              name="signatureFile"
              className="file-input file-input-bordered w-full"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </div>

          {signaturePreview && (
            <div className="flex justify-center mt-4 p-4 border border-dashed rounded-md bg-base-200">
              <img
                src={signaturePreview}
                alt="Signature Preview"
                className="max-w-xs h-auto object-contain"
              />
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
              "สร้างเอกสาร"
            )}
          </button>
        </form>

        {message && (
          <div
            className={`alert ${
              isError ? "alert-error" : "alert-success"
            } mt-6`}
          >
            <span>{message}</span>
          </div>
        )}

        {generatedFileUrl && (
          <div className="mt-6 text-center">
            <p className="mb-2">เอกสาร Word ของคุณพร้อมแล้ว:</p>
            <a
              href={generatedFileUrl}
              download={downloadFileName}
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