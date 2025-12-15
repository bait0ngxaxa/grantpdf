'use client';

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hook/useTitle";

interface SummaryData {
  fileName: string;
  projectName: string;
  contractNumber: string;
  organize: string;
  projectOwner: string;
  projectReview: string;
  inspector: string;
  coordinator: string;
  projectCode: string;
  projectActivity: string;
  projectNhf: string;
  projectCo: string;
  month: string;
  timeline: string;
  sec1: string;
  sec2: string;
  sec3: string;
  sum: string;
  funds: string;
}

export default function CreateWordSummaryPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<SummaryData>({
    fileName: "",
    projectName: "",
    contractNumber: "",
    organize: "",
    projectOwner: "",
    projectReview: "",
    inspector: "",
    coordinator: "",
    projectCode: "",
    projectActivity: "",
    projectNhf: "",
    projectCo: "",
    month: "",
    timeline: "",
    sec1: "",
    sec2: "",
    sec3: "",
    sum: "",
    funds: "",
  });

  const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useTitle("สร้างแบบสรุปโครงการ | ระบบจัดการเอกสาร");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleBack = () => {
    router.push("/createdocs");
  };

  const openPreviewModal = () => {
    setIsPreviewOpen(true);
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
        data.append(key, formData[key as keyof SummaryData]);
      });
      
      if (session.user?.id) {
        data.append("userId", session.user.id.toString());
      }
      if (session.user?.email) {
        data.append("userEmail", session.user.email);
      }
      
      
      const selectedProjectId = localStorage.getItem('selectedProjectId');
      if (selectedProjectId) {
        data.append("projectId", selectedProjectId);
      }

      const response = await fetch("/api/fill-excel-summary-template", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.downloadUrl) {
          setGeneratedFileUrl(result.downloadUrl);
          setMessage("สร้างเอกสาร Excel สำเร็จแล้ว!");
          setIsError(false);
          setIsSuccessModalOpen(true);
        }
      } else {
        const errorText = await response.text();
        setMessage(`เกิดข้อผิดพลาด: ${errorText || "ไม่สามารถสร้างเอกสาร Excel ได้"}`);
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

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans antialiased">
      <div className="bg-white rounded-2xl shadow-lg mb-6 w-full max-w-5xl p-4">
        <div className="flex items-center">
          <Button
            onClick={handleBack}
            className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
            <span className="ml-2">กลับ</span>
          </Button>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-3xl font-bold text-center">
            สร้างแบบสรุปโครงการ
          </h2>
          <p className="text-center mt-2 text-blue-100">
            กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารแบบสรุปโครงการ
          </p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ข้อมูลโครงการ */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-300">
                📋 ข้อมูลโครงการ
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ชื่อไฟล์{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="fileName"
                    placeholder="ระบุชื่อไฟล์ที่ต้องการบันทึก"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.fileName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ชื่อโครงการ{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="projectName"
                    placeholder="ระบุชื่อโครงการ"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectName}
                    onChange={handleChange}
                    required
                  />
                </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    รหัสชุดโครงการ
                  </label>
                  <Input
                    type="text"
                    name="projectCode"
                    placeholder="ระบุรหัสชุดโครงการ"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectCode}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    รหัสภายใต้กิจกรรม
                  </label>
                  <Input
                    type="text"
                    name="projectActivity"
                    placeholder="ระบุรหัสภายใต้กิจกรรม"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectActivity}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    เลขที่สัญญา
                  </label>
                  <Input
                    type="text"
                    name="contractNumber"
                    placeholder="ระบุเลขที่สัญญา"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.contractNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    หน่วยงานที่เสนอโครงการ
                  </label>
                  <Input
                    type="text"
                    name="organize"
                    placeholder="ระบุหน่วยงานที่เสนอโครงการ"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.organize}
                    onChange={handleChange}
                  />
                </div>
              
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    เลขที่ มสช น.
                  </label>
                  <Input
                    type="text"
                    name="projectNhf"
                    placeholder="ระบุเลขที่ มสช น."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectNhf}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ชุดโครงการ
                  </label>
                  <Input
                    type="text"
                    name="projectCo"
                    placeholder="ระบุชุดโครงการ"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectCo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ระยะเวลาดำเนินการ (เดือน)
                  </label>
                  <Input
                    type="number"
                    name="month"
                    placeholder="ระบุจำนวนเดือน"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.month}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ระยะเวลา
                  </label>
                  <Input
                    type="text"
                    name="timeline"
                    placeholder="ระบุระยะเวลา เช่น 1มกราคม 2568 - 31กันยายน 2568"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.timeline}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลผู้เกี่ยวข้อง */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-blue-300">
                👤 ข้อมูลผู้เกี่ยวข้อง
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ผู้เสนอโครงการ
                  </label>
                  <Input
                    type="text"
                    name="projectOwner"
                    placeholder="ระบุผู้เสนอโครงการ"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectOwner}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ผู้ทบทวนโครงการ
                  </label>
                  <Input
                    type="text"
                    name="projectReview"
                    placeholder="ระบุผู้ทบทวนโครงการ"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectReview}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ผู้ประสานงาน
                  </label>
                  <Input
                    type="text"
                    name="coordinator"
                    placeholder="ระบุผู้ประสานงาน"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.coordinator}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลงบประมาณ */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-green-300">
                💰 ข้อมูลงบประมาณ
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    งวด 1
                  </label>
                  <Input
                    type="number"
                    name="sec1"
                    placeholder="ระบุจำนวนเงินงวด 1 (ตัวเลข)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.sec1}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    งวด 2
                  </label>
                  <Input
                    type="number"
                    name="sec2"
                    placeholder="ระบุจำนวนเงินงวด 2 (ตัวเลข)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.sec2}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    งวด 3
                  </label>
                  <Input
                    type="number"
                    name="sec3"
                    placeholder="ระบุจำนวนเงินงวด 3 (ตัวเลข)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.sec3}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    รวม
                  </label>
                  <Input
                    type="number"
                    name="sum"
                    placeholder="ระบุจำนวนเงินรวม (ตัวเลข)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.sum}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    แหล่งทุน
                  </label>
                  <Input
                    type="text"
                    name="funds"
                    placeholder="ระบุแหล่งทุน"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.funds}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                onClick={openPreviewModal}
                className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                ดูตัวอย่างข้อมูล
              </Button>
              <Button
                type="submit"
                className="cursor-pointer flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    กำลังสร้างเอกสาร...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    ยืนยันสร้างเอกสาร
                  </>
                )}
              </Button>
            </div>
          </form>

          {message && isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ตัวอย่างข้อมูลที่จะสร้างเอกสาร</DialogTitle>
            <DialogDescription>
              กรุณาตรวจสอบข้อมูลของคุณก่อนสร้างเอกสาร
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ชื่อไฟล์:</h4>
                <p className="text-sm">{formData.fileName || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ชื่อโครงการ:</h4>
                <p className="text-sm">{formData.projectName || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">เลขที่สัญญา:</h4>
                <p className="text-sm">{formData.contractNumber || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">หน่วยงาน:</h4>
                <p className="text-sm">{formData.organize || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">รหัสชุดโครงการ:</h4>
                <p className="text-sm">{formData.projectCode || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">รหัสกิจกรรม:</h4>
                <p className="text-sm">{formData.projectActivity || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">เลขที่ มสช:</h4>
                <p className="text-sm">{formData.projectNhf || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ชุดโครงการ:</h4>
                <p className="text-sm">{formData.projectCo || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">จำนวนเดือน:</h4>
                <p className="text-sm">{formData.month || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ระยะเวลา:</h4>
                <p className="text-sm">{formData.timeline || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">เจ้าของโครงการ:</h4>
                <p className="text-sm">{formData.projectOwner || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ผู้ตรวจสอบโครงการ:</h4>
                <p className="text-sm">{formData.projectReview || '-'}</p>
              </div>
            
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ผู้ประสานงาน:</h4>
                <p className="text-sm">{formData.coordinator || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">งวด 1:</h4>
                <p className="text-sm">{formData.sec1 || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">งวด 2:</h4>
                <p className="text-sm">{formData.sec2 || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">งวด 3:</h4>
                <p className="text-sm">{formData.sec3 || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">รวม:</h4>
                <p className="text-sm">{formData.sum || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">แหล่งทุน:</h4>
                <p className="text-sm">{formData.funds || '-'}</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer rounded-lg">แก้ไข</Button>
            </DialogClose>
            <Button onClick={() => {
              setIsPreviewOpen(false);
              document.querySelector('form')?.requestSubmit();
            }} className="cursor-pointer rounded-lg">
              ยืนยันและสร้างเอกสาร
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <CreateDocSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        fileName={formData.fileName}
        downloadUrl={generatedFileUrl}
        documentType="เอกสาร Excel "
      />
    </div>
  );
}
