import { ClipboardList } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type ContractData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface ProjectDetailsSectionProps {
    formData: ContractData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    errors: Partial<Record<keyof ContractData, string>>;
    contractCode: string;
}

export function ProjectDetailsSection({
    formData,
    handleChange,
    errors,
    contractCode,
}: ProjectDetailsSectionProps): React.JSX.Element {
    return (
        <FormSection
            title="ข้อมูลโครงการ"
            icon={
                <ClipboardList className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                    label="ชื่อไฟล์"
                    name="fileName"
                    placeholder="ระบุชื่อไฟล์ที่ต้องการบันทึก"
                    value={formData.fileName}
                    onChange={handleChange}
                    error={errors.fileName}
                    required
                />
                <FormField
                    label="ชื่อโครงการ"
                    name="projectName"
                    placeholder="ระบุชื่อโครงการ"
                    value={formData.projectName}
                    onChange={handleChange}
                    error={errors.projectName}
                    required
                />
                <FormField
                    label="วันที่จัดทำสัญญา"
                    name="date"
                    placeholder="ระบุวัน เดือน ปี เช่น 1 มกราคม 2568"
                    value={formData.date}
                    onChange={handleChange}
                    error={errors.date}
                    required
                />

                {contractCode && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            รหัสสัญญา
                        </label>
                        <div className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {contractCode}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            รหัสนี้จะใช้เป็นเลขที่สัญญาโดยอัตโนมัติ
                        </p>
                    </div>
                )}

                <FormField
                    label="ระหว่าง"
                    name="projectOffer"
                    placeholder="ระบุหน่วยงานที่ดำเนินการร่วมกัน เช่น สพบ. และ สสส."
                    value={formData.projectOffer}
                    onChange={handleChange}
                    error={errors.projectOffer}
                    required
                />
                <FormField
                    label="โดย"
                    name="owner"
                    placeholder="ระบุชื่อผู้อำนวยการ ผู้จัดการโครงการ"
                    value={formData.owner}
                    onChange={handleChange}
                    error={errors.owner}
                    required
                />
                <FormField
                    label="รับดำเนินโครงการจาก"
                    name="projectCo"
                    placeholder="ระบุองค์กรให้ทุน"
                    value={formData.projectCo}
                    onChange={handleChange}
                    error={errors.projectCo}
                    required
                />
                <FormField
                    label="รหัสโครงการ"
                    name="projectCode"
                    placeholder="ระบุรหัสโครงการ"
                    value={formData.projectCode}
                    onChange={handleChange}
                    error={errors.projectCode}
                    required
                />
                <FormField
                    label="ตามข้อตกลงเลขที่"
                    name="acceptNum"
                    placeholder="ระบุเลขที่ข้อตกลง"
                    value={formData.acceptNum}
                    onChange={handleChange}
                    error={errors.acceptNum}
                    required
                />
            </div>
        </FormSection>
    );
}
