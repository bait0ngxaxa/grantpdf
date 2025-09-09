'use client';

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { useTitle } from "@/hook/useTitle";

interface WordDocumentData {
  projectName: string; // เพิ่มชื่อโครงการ
  contractnumber: string;
  projectOffer: string;
  projectCo: string;
  owner: string;
  acceptNum: string;
  projectCode: string;
  cost: string;
  timelineMonth: string;
  timelineText: string;
  section : string;
  date: string;
  name: string;
  address: string;
  citizenid: string;
  citizenexpire: string;
  witness: string;
}

export default function CreateContractPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<WordDocumentData>({
    projectName: "",
    contractnumber: "",
    projectOffer: "",
    projectCo: "",
    owner: "",
    acceptNum: "",
    projectCode: "",
    cost: "",
    timelineMonth: "",
    timelineText: "",
    section: "",
    name: "",
    address: "",
    citizenid: "",
    citizenexpire: "",
    date: "",
    witness: "",
  });

  
  const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useTitle("สร้างหนังสือสัญญาเพื่อรับรองการลงนาม | ระบบจัดการเอกสาร");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        data.append(key, formData[key as keyof WordDocumentData]);
      });
      
      if (session.user?.id) {
        data.append("userId", session.user.id.toString());
      }
      if (session.user?.email) {
        data.append("userEmail", session.user.email);
      }
      if ((session as any)?.accessToken) {
        data.append("token", (session as any).accessToken);
      }

      const response = await fetch("/api/fill-contract-template", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedFileUrl(url);
        setMessage("สร้างเอกสาร Word สำเร็จแล้ว!");
        setIsError(false);
        setIsSuccessModalOpen(true);
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

  const downloadFileName = formData.projectName.endsWith('.docx') ? formData.projectName: `${formData.projectName}.docx`;

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
            สร้างหนังสือสัญญาเพื่อรับรองการลงนาม
          </h2>
          <p className="text-center mt-2 text-blue-100">
            กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารสัญญา
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
                    วันที่จัดทำสัญญา{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="date"
                    placeholder="ระบุวัน เดือน ปี เช่น 1 มกราคม 2568"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    สัญญาเลขที่{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="contractnumber"
                    placeholder="ระบุเลขที่สัญญา"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.contractnumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ระหว่าง{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="projectOffer"
                    placeholder="ระบุหน่วยงานที่ดำเนินการร่วมกัน เช่น สพบ. และ สสส."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectOffer}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    โดย{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="owner"
                    placeholder="ระบุชื่อผู้อำนวยการ ผู้จัดการโครงการ"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.owner}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2  w-full">
                    รับดำเนินโครงการจาก{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="projectCo"
                    placeholder="ระบุองค์กรให้ทุน"
                    className=" w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectCo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2  w-full">
                    รหัสโครงการ{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="projectCode"
                    placeholder="ระบุรหัสโครงการ"
                    className=" w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.projectCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ตามข้อตกลงเลขที่{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="acceptNum"
                    placeholder="ระบุเลขที่ข้อตกลง"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.acceptNum}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ชื่อผู้จ้าง{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="ระบุชื่อผู้จ้าง"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ที่อยู่{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="address"
                    placeholder="ระบุที่อยู่ติดต่อผู้จ้าง"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2  w-full">
                    บัตรประชาชนเลขที่{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="citizenid"
                    placeholder="ระบุเลขบัตรประชาชน 13 หลักผู้จ้าง"
                    className=" w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.citizenid}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2  w-full">
                    วันหมดอายุบัตรประชาชน{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="citizenexpire"
                    placeholder="ระบุวันหมดอายุ ตัวอย่าง 31 ธันวาคม 2568"
                    className=" w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.citizenexpire}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ชื่อพยาน{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="witness"
                    placeholder="ระบุชื่อพยาน"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.witness}
                    onChange={handleChange}
                    required
                  />
                </div>
               
              </div>
            </div>

            {/* ข้อมูลผู้ลงนาม */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-blue-300">
                👤 ข้อมูลงบประมาณ ระยะเวลา จำนวนงวด
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    งบประมาณ{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="cost"
                    placeholder="ตัวอย่าง : 500,000 บาท (ห้าแสนบาทถ้วน)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ระยะเวลา (เดือน){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="timelineMonth"
                    placeholder="ระบุตัวเลข เช่น 12 (ใส่เฉพาะตัวเลข)"
                    className="w-full px-4 py-3  border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    value={formData.timelineMonth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    เริ่มตั้งแต่{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="timelineText"
                    placeholder="ตัวอย่าง : 1 มกราคม 2568 ถึง 31 ธันวาคม 2568"
                    className="w-full px-4 py-3  border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    value={formData.timelineText}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    จำนวนงวด{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="section"
                    placeholder="ระบุเลขจำนวนงวด เช่น 3 (ใส่เฉพาะตัวเลข)"
                    className="w-full px-4 py-3  border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    value={formData.section}
                    onChange={handleChange}
                    required
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
                <p className="text-sm">{formData.projectName || '-'}</p>
              </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">สัญญาเลขที่:</h4>
                    <p className="text-sm">{formData.contractnumber || '-'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">วันที่:</h4>
                    <p className="text-sm">{formData.date || '-'}</p>
                  </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ระหว่าง:</h4>
                <p className="text-sm">{formData.projectOffer || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">โดย:</h4>
                <p className="text-sm">{formData.owner || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">รับดำเนินโครงการจาก:</h4>
                <p className="text-sm">{formData.projectCo || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">รหัสโครงการ:</h4>
                <p className="text-sm">{formData.projectCode || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ตามข้อตกลงเลขที่:</h4>
                <p className="text-sm">{formData.acceptNum || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ชื่อผู้จ้าง:</h4>
                <p className="text-sm">{formData.name || '-'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ที่อยู่:</h4>
                <p className="text-sm">{formData.address || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">เลขบัตรประชาชน:</h4>
                <p className="text-sm">{formData.citizenid || '-'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-gray-600">วันหมดอายุ:</h4>
              <p className="text-sm">{formData.citizenexpire || '-'}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-600">ชื่อพยาน:</h4>
              <p className="text-sm">{formData.witness || '-'}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-gray-600">งบประมาณ:</h4>
              <p className="text-sm">{formData.cost || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">ระยะเวลา (เดือน):</h4>
              <p className="text-sm">{formData.timelineMonth || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">เริ่มตั้งแต่:</h4>
              <p className="text-sm">{formData.timelineText || '-'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">จำนวนงวด:</h4>
              <p className="text-sm">{formData.section || '-'}</p>
            </div>
            </div>
            
            
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer rounded-lg">แก้ไข</Button>
            </DialogClose>
            <Button onClick={() => {
              setIsPreviewOpen(false);
              document.querySelector('form')?.requestSubmit();
            }} className="cursor-pointer rounded-lg ">
              ยืนยันและสร้างเอกสาร
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">สร้างเอกสารสำเร็จ!</DialogTitle>
            <DialogDescription>
              เอกสาร Word ของคุณพร้อมแล้ว
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-center text-gray-600">
              ไฟล์: {downloadFileName}
            </p>
          </div>
          
          <DialogFooter className="flex-col space-y-2">
            {generatedFileUrl && (
              <a
                href={generatedFileUrl}
                download={downloadFileName}
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  ดาวน์โหลดเอกสาร
                </Button>
              </a>
            )}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setIsSuccessModalOpen(false);
                router.push('/userdashboard');
              }}
            >
              กลับไปหน้าหลัก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}