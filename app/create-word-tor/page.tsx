"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
    DialogClose,
} from "@/components/ui/dialog";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hook/useTitle";


interface TORData {
    projectName: string; // เพิ่มชื่อโครงการ
    fileName: string;
    owner: string;
    address: string;
    email: string;
    tel: string;
    timeline: string;
    contractnumber: string;
    cost: string;
    topic1: string;
    objective1: string;
    objective2: string;
    objective3: string;
    target: string;
    zone: string;
    plan: string;
    projectmanage: string;
    partner: string;
    date: string;
}

// Interface สำหรับตารางกิจกรรม
interface ActivityData {
    activity: string;

    manager: string;
    evaluation2: string;
    duration: string;
}

export default function CreateTORPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState<TORData>({
        projectName: "", 
        fileName: "",
        date: "",
        owner: "",
        address: "",
        email: "",
        tel: "",
        timeline: "",
        contractnumber: "",
        cost: "",
        topic1: "",
        objective1: "",
        objective2: "",
        objective3: "",
        target: "",
        zone: "",
        plan: "",
        projectmanage: "",
        partner: "",
    });

    // State สำหรับตารางกิจกรรม
    const [activities, setActivities] = useState<ActivityData[]>([
        { activity: "", manager: "", evaluation2: "", duration: "" },
    ]);

    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(
        null
    );
    const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(
        null
    );
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    useTitle("สร้างเอกสาร TOR | ระบบจัดการเอกสาร");

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleBack = () => {
        router.push("/createdocs");
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

    // ฟังก์ชันจัดการตารางกิจกรรม
    const addActivityRow = () => {
        setActivities([
            ...activities,
            { activity: "", manager: "", evaluation2: "", duration: "" },
        ]);
    };

    const removeActivityRow = (index: number) => {
        if (activities.length > 1) {
            setActivities(activities.filter((_, i) => i !== index));
        }
    };

    const updateActivity = (
        index: number,
        field: keyof ActivityData,
        value: string
    ) => {
        const updatedActivities = activities.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setActivities(updatedActivities);
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
                data.append(key, formData[key as keyof TORData]);
            });

            // เพิ่มข้อมูลตารางกิจกรรม
            data.append("activities", JSON.stringify(activities));

            if (signatureFile) {
                data.append("signatureFile", signatureFile);
            }

            if (session.user?.id) {
                data.append("userId", session.user.id.toString());
            }
            if (session.user?.email) {
                data.append("userEmail", session.user.email);
            }
            
            // Add project ID if available
            const selectedProjectId = localStorage.getItem('selectedProjectId');
            if (selectedProjectId) {
                data.append("projectId", selectedProjectId);
            }
            
            if ((session as any)?.accessToken) {
                data.append("token", (session as any).accessToken);
            }

            const response = await fetch("/api/fill-tor-template", {
                method: "POST",
                body: data,
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.downloadUrl) {
                    setGeneratedFileUrl(result.downloadUrl);
                    setMessage(
                        `สร้างเอกสาร TOR สำเร็จแล้ว! โครงการ: ${
                            result.project?.name || "ไม่ระบุ"
                        }`
                    );
                    setIsError(false);
                    setIsSuccessModalOpen(true);
                } else {
                    setMessage("ไม่สามารถสร้างเอกสาร TOR ได้");
                    setIsError(true);
                }
            } else {
                const errorText = await response.text();
                setMessage(
                    `เกิดข้อผิดพลาด: ${
                        errorText || "ไม่สามารถสร้างเอกสาร TOR ได้"
                    }`
                );
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
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-50 to-green-50 p-4 font-sans antialiased">
            <div className="bg-white rounded-2xl shadow-lg mb-6 w-full max-w-6xl p-4">
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

            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <h2 className="text-3xl font-bold text-center">
                        สร้างเอกสาร Terms of Reference (TOR)
                    </h2>
                    <p className="text-center mt-2 text-green-100">
                        กรุณากรอกข้อมูลโครงการและกิจกรรมให้ครบถ้วน
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* ข้อมูลพื้นฐาน */}
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-300">
                                📋 ข้อมูลพื้นฐานโครงการ
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
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        วันที่จัดทำ{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="date"
                                        placeholder="ระบุวัน เดือน ปี เช่น 1 มกราคม 2566"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        เลขที่สัญญา{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="contractnumber"
                                        placeholder="ระบุเลขที่สัญญา"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.contractnumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ผู้รับผิดชอบ{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="owner"
                                        placeholder="ระบุชื่อผู้รับผิดชอบ"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.owner}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        สถานที่ติดต่อ{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="address"
                                        placeholder="ระบุสถานที่ติดต่อผู้รับผิดชอบ"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        อีเมล{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="email"
                                        placeholder="ระบุอีเมลผู้รับผิดชอบ"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        เบอร์โทร{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="tel"
                                        placeholder="ระบุเบอร์โทรผู้รับผิดชอบ"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.tel}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ระยะเวลาโครงการ{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="timeline"
                                        placeholder="เช่น 1 มกราคม 2566 - 31 ธันวาคม 2566"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.timeline}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        งบประมาณ{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="cost"
                                        placeholder="เช่น 500000 บาท (ห้าแสนบาทถ้วน)"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.cost}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* รายละเอียดโครงการ */}
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-blue-300">
                                📄 รายละเอียดโครงการ
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        หลักการและเหตุผล{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="topic1"
                                        placeholder="หลักการและเหตุผล"
                                        className="w-full px-4 py-3 h-96 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.topic1}
                                        onChange={handleChange}
                                        //rows={30}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        วัตถุประสงค์ {" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="objective1"
                                        placeholder="วัตถุประสงค์โครงการ"
                                        className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.objective1}
                                        onChange={handleChange}
                                        //rows={30}
                                    />
                                </div>
                                
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        กลุ่มเป้าหมาย{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="target"
                                        placeholder="กลุ่มเป้าหมายของโครงการ"
                                        className="w-full px-4 py-3 border h-40 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.target}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ขอบเขตและการจัดการ */}
                        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-yellow-300">
                                🎯 ขอบเขตและการจัดการ
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        พื้นที่/เขต{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="zone"
                                        placeholder="พื้นที่หรือเขตดำเนินการ"
                                        className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        value={formData.zone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        แผนการดำเนินงาน{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="plan"
                                        placeholder="แผนการดำเนินงานโครงการ"
                                        className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors "
                                        value={formData.plan}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        การจัดการโครงการ{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="projectmanage"
                                        placeholder="วิธีการจัดการและบริหารโครงการ"
                                        className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors "
                                        value={formData.projectmanage}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        องค์กร ภาคี ร่วมงาน{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="partner"
                                        placeholder="องค์กร ภาค ร่วมงาน"
                                        className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors "
                                        value={formData.partner}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ตารางกิจกรรม */}
                        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-indigo-300">
                                📊 การกำกับติดตามและประเมินผล
                            </h3>

                            <div className="space-y-4">
                                {/* Header */}
                                <div className="grid grid-cols-4 gap-2 p-2 bg-indigo-100 rounded-lg font-semibold text-sm">
                                    <div>กิจกรรม</div>
                                    <div>ผู้ติดตามโครงการ</div>
                                    <div>วิธีการประเมินผล</div>
                                    <div>ระยะเวลา</div>
                                </div>

                                {/* Dynamic Rows */}
                                {activities.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-4 gap-2 p-2 border border-slate-200 rounded-lg bg-white"
                                    >
                                        <Textarea
                                            placeholder="กิจกรรม"
                                            value={activity.activity}
                                            onChange={(e) =>
                                                updateActivity(
                                                    index,
                                                    "activity",
                                                    e.target.value
                                                )
                                            }
                                            className="text-sm h-40"
                                        />
                                        <Textarea
                                            placeholder="ผู้ติดตามโครงการ"
                                            value={activity.manager}
                                            onChange={(e) =>
                                                updateActivity(
                                                    index,
                                                    "manager",
                                                    e.target.value
                                                )
                                            }
                                            className="text-sm h-40"
                                        />
                                        <Textarea
                                            placeholder="วิธีการประเมินผล"
                                            value={activity.evaluation2}
                                            onChange={(e) =>
                                                updateActivity(
                                                    index,
                                                    "evaluation2",
                                                    e.target.value
                                                )
                                            }
                                            className="text-sm h-40"
                                        />
                                        <div className="flex gap-1">
                                            <Textarea
                                                placeholder="ระยะเวลา"
                                                value={activity.duration}
                                                onChange={(e) =>
                                                    updateActivity(
                                                        index,
                                                        "duration",
                                                        e.target.value
                                                    )
                                                }
                                                className="text-sm h-40"
                                            />
                                            {activities.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        removeActivityRow(index)
                                                    }
                                                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs"
                                                >
                                                    ลบ
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Row Button */}
                                <Button
                                    type="button"
                                    onClick={addActivityRow}
                                    className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-300 py-2 rounded-lg"
                                >
                                    + เพิ่มแถว
                                </Button>
                            </div>
                        </div>

                        {/* อัปโหลดลายเซ็น
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-gray-300">
                                🖼️ อัปโหลดลายเซ็น
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    อัปโหลดลายเซ็น (.png, .jpeg)
                                </label>
                                <Input
                                    type="file"
                                    name="signatureFile"
                                    className="border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                    accept="image/png, image/jpeg"
                                    onChange={handleFileChange}
                                />
                                {signaturePreview && (
                                    <div className="flex justify-center mt-4 p-4 border border-dashed rounded-lg bg-slate-50">
                                        <img
                                            src={signaturePreview}
                                            alt="Signature Preview"
                                            className="max-w-xs h-auto object-contain border rounded-lg shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div> */}

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                            <Button
                                type="button"
                                onClick={openPreviewModal}
                                className="cursor-pointer flex-1 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            ตัวอย่างข้อมูล TOR ที่จะสร้างเอกสาร
                        </DialogTitle>
                        <DialogDescription>
                            กรุณาตรวจสอบข้อมูลของคุณก่อนสร้างเอกสาร
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    ชื่อโครงการ:
                                </h4>
                                <p className="text-sm">
                                    {formData.projectName || "-"}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    วันที่:
                                </h4>
                                <p className="text-sm">
                                    {formData.date || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    เลขที่สัญญา:
                                </h4>
                                <p className="text-sm">
                                    {formData.contractnumber || "-"}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    ผู้รับผิดชอบ:
                                </h4>
                                <p className="text-sm">
                                    {formData.owner || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    ที่อยู่:
                                </h4>
                                <p className="text-sm">
                                    {formData.address || "-"}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    กำหนดเวลา:
                                </h4>
                                <p className="text-sm">
                                    {formData.timeline || "-"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                หัวข้อ/เรื่อง:
                            </h4>
                            <p className="text-sm">{formData.topic1 || "-"}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                วัตถุประสงค์
                            </h4>
                            <p className="text-sm whitespace-pre-wrap">
                                {formData.objective1 || "-"}
                            </p>
                        </div>

                        {formData.objective2 && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    วัตถุประสงค์ที่ 2:
                                </h4>
                                <p className="text-sm whitespace-pre-wrap">
                                    {formData.objective2}
                                </p>
                            </div>
                        )}

                        {formData.objective3 && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    วัตถุประสงค์ที่ 3:
                                </h4>
                                <p className="text-sm whitespace-pre-wrap">
                                    {formData.objective3}
                                </p>
                            </div>
                        )}

                        {/* แสดงตารางกิจกรรม */}
                        {activities.length > 0 &&
                            activities.some((a) => a.activity) && (
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-600 mb-2">
                                        ตารางกิจกรรม:
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs border border-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-2 py-1 border">
                                                        กิจกรรม
                                                    </th>
                                                    <th className="px-2 py-1 border">
                                                        ผู้รับผิดชอบ
                                                    </th>
                                                    <th className="px-2 py-1 border">
                                                        ระยะเวลา
                                                    </th>
                                                    <th className="px-2 py-1 border">
                                                        งบประมาณ
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activities.map(
                                                    (activity, index) => (
                                                        <tr key={index}>
                                                            <td className="px-2 py-1 border">
                                                                {activity.activity ||
                                                                    "-"}
                                                            </td>
                                                            <td className="px-2 py-1 border">
                                                                {activity.manager ||
                                                                    "-"}
                                                            </td>
                                                            <td className="px-2 py-1 border">
                                                                {activity.evaluation2 ||
                                                                    "-"}
                                                            </td>
                                                            <td className="px-2 py-1 border">
                                                                {activity.duration ||
                                                                    "-"}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    เบอร์โทรศัพท์:
                                </h4>
                                <p className="text-sm">{formData.tel || "-"}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    อีเมล:
                                </h4>
                                <p className="text-sm">
                                    {formData.email || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    กลุ่มเป้าหมาย:
                                </h4>
                                <p className="text-sm">
                                    {formData.target || "-"}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    ค่าใช้จ่าย:
                                </h4>
                                <p className="text-sm">
                                    {formData.cost || "-"}
                                </p>
                            </div>
                        </div>

                        {formData.zone && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    พื้นที่/เขต:
                                </h4>
                                <p className="text-sm">{formData.zone}</p>
                            </div>
                        )}

                        {formData.plan && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    แผนการดำเนินงาน:
                                </h4>
                                <p className="text-sm whitespace-pre-wrap">
                                    {formData.plan}
                                </p>
                            </div>
                        )}

                        {formData.projectmanage && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    การจัดการโครงการ:
                                </h4>
                                <p className="text-sm whitespace-pre-wrap">
                                    {formData.projectmanage}
                                </p>
                            </div>
                        )}

                        {/* {signaturePreview && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">ลายเซ็น:</h4>
                                <img
                                    src={signaturePreview}
                                    alt="Signature Preview"
                                    className="max-w-xs h-auto object-contain mt-2 border rounded"
                                />
                            </div>
                        )} */}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="cursor-pointer rounded-lg"
                            >
                                แก้ไข
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={() => {
                                setIsPreviewOpen(false);
                                document.querySelector("form")?.requestSubmit();
                            }}
                            className="cursor-pointer rounded-lg "
                        >
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
                documentType="เอกสาร TOR "
            />
        </div>
    );
}
