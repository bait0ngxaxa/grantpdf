import { ClipboardList } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type FormProjectData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface BasicInfoSectionProps {
    formData: FormProjectData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    handlePhoneChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    errors: Partial<Record<keyof FormProjectData, string>>;
}

export function BasicInfoSection({
    formData,
    handleChange,
    handlePhoneChange,
    errors,
}: BasicInfoSectionProps): React.JSX.Element {
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
                    label="ผู้รับผิดชอบ"
                    name="person"
                    placeholder="ระบุชื่อผู้รับผิดชอบโครงการ"
                    value={formData.person}
                    onChange={handleChange}
                    error={errors.person}
                    required
                />
                <FormField
                    label="ที่อยู่ สถานที่ติดต่อ"
                    name="address"
                    placeholder="ระบุที่อยู่ติดต่อผู้รับผิดชอบ"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    required
                />
                <FormField
                    label="เบอร์โทรศัพท์"
                    name="tel"
                    type="tel"
                    placeholder="ระบุเบอร์โทรศัพท์ผู้รับผิดชอบ"
                    value={formData.tel}
                    onChange={handlePhoneChange}
                    required
                    maxLength={10}
                    error={errors.tel}
                />
                <FormField
                    label="อีเมล"
                    name="email"
                    type="email"
                    placeholder="ระบุอีเมลผู้รับผิดชอบ example@mail.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                />
                <FormField
                    label="ระยะเวลาดำเนินการ"
                    name="timeline"
                    placeholder="ตัวอย่าง 1 มกราคม 2566 - 31 ธันวาคม 2566"
                    value={formData.timeline}
                    onChange={handleChange}
                    error={errors.timeline}
                    required
                />
                <FormField
                    label="งบประมาณ"
                    name="cost"
                    placeholder="ตัวอย่าง 1000000 บาท (หนึ่งล้านบาทถ้วน)"
                    value={formData.cost}
                    onChange={handleChange}
                    error={errors.cost}
                    required
                />
            </div>
        </FormSection>
    );
}
