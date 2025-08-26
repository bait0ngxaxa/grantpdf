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

interface WordDocumentData {
  projectname: string;
  projectname2: string;
  name: string;
  address: string;
  citizenid: string;
  citizenexpire: string;
}

export default function CreateContractPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<WordDocumentData>({
    projectname: "",
    projectname2: "",
    name: "",
    address: "",
    citizenid: "",
    citizenexpire: "",
  });

  
  const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  

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

  const downloadFileName = formData.projectname.endsWith('.docx') ? formData.projectname: `${formData.projectname}.docx`;

  return (
    <div className="min-h-screen flex flex-col items-center bg-base-200 p-4 font-sans antialiased">
      <div className="navbar bg-base-100 rounded-box shadow-lg mb-6 w-full max-w-4xl">
      <div className="flex-1">
                    <Button onClick={handleBack} >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="ml-2">กลับ</span>
                    </Button>
                </div>
      </div>

      <div className="card w-full max-w-4xl shadow-xl bg-base-100 p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">
          สร้างหนังสือสัญญาเพื่อรับรองการลงนาม
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  ชื่อโครงการ 
                </span>
              </label>
              <Input
                type="text"
                name="projectname"
                placeholder="ชื่อโครงการ(ชื่อไฟล์)"
                className="input input-bordered w-full"
                value={formData.projectname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  ชื่อผู้ลงนาม
                </span>
              </label>
              <Input
                type="text"
                name="name"
                placeholder="ผู้ลงนาม"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
            
            

           
            
            
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                เลขบัตรประชาชน
              </span>
            </label>
            <Input
              type="text"
              name="citizenid"
              placeholder="หมายเลข 13 หลัก"
              className="input input-bordered w-full"
              value={formData.citizenid}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                วันหมดอายุ
              </span>
            </label>
            <Input
              name="citizenexpire"
              placeholder="วันหมดอายุบัตรประชาชน"
              className="input input-bordered w-full"
              value={formData.citizenexpire}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                ชื่อโครงการในสัญญา
              </span>
            </label>
            <Input
              name="projectname2"
              placeholder="ชื่อโครงการในรายละเอียดสัญญา"
              className="input input-bordered w-full"
              value={formData.projectname2}
              onChange={handleChange}
            />
            </div>
            
          </div>
          <div className="form-control">
              <label className="label">
                <span className="label-text">
                  ที่อยู่
                </span>
              </label>
              <Textarea
                
                name="address"
                placeholder="ที่อยู่ผู้ลงนาม"
                className="textarea textarea-bordered h-20 w-full"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

          

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={openPreviewModal}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              ดูตัวอย่างข้อมูล
            </Button>
            <Button
              type="submit"
              className="flex-1"
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
            </Button>
          </div>
        </form>

        

        {message && isError && (
          <div className="alert alert-error mt-6">
            <span>{message}</span>
          </div>
        )}
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
                <p className="text-sm">{formData.projectname || '-'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600">ชื่อ:</h4>
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
              <h4 className="font-semibold text-sm text-gray-600">ชื่อโครงการในสัญญา:</h4>
              <p className="text-sm">{formData.projectname2 || '-'}</p>
            </div>
            </div>
            
            
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">แก้ไข</Button>
            </DialogClose>
            <Button onClick={() => {
              setIsPreviewOpen(false);
              document.querySelector('form')?.requestSubmit();
            }}>
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