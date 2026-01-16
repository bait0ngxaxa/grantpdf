import { ClipboardList } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type TORData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface BasicInfoSectionProps {
    formData: TORData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    handlePhoneChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof TORData, string>>;
}

export function BasicInfoSection({
    formData,
    handleChange,
    handlePhoneChange,
    errors,
}: BasicInfoSectionProps): React.JSX.Element {
    return (
        <FormSection
            title="ข้อมูลพื้นฐานโครงการ"
            icon={<ClipboardList className="w-5 h-5 text-slate-600" />}
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
                    label="วันที่จัดทำ"
                    name="date"
                    placeholder="ระบุวัน เดือน ปี เช่น 1 มกราคม 2566"
                    value={formData.date}
                    onChange={handleChange}
                    error={errors.date}
                    required
                />
                <FormField
                    label="เลขที่สัญญา"
                    name="contractnumber"
                    placeholder="ระบุเลขที่สัญญา"
                    value={formData.contractnumber}
                    onChange={handleChange}
                    error={errors.contractnumber}
                    required
                />
                <FormField
                    label="ผู้รับผิดชอบ"
                    name="owner"
                    placeholder="ระบุชื่อผู้รับผิดชอบ"
                    value={formData.owner}
                    onChange={handleChange}
                    error={errors.owner}
                    required
                />
                <FormField
                    label="สถานที่ติดต่อ"
                    name="address"
                    placeholder="ระบุสถานที่ติดต่อผู้รับผิดชอบ"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    required
                />
                <FormField
                    label="อีเมล"
                    name="email"
                    type="email"
                    placeholder="ระบุอีเมลผู้รับผิดชอบ"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                />
                <FormField
                    label="เบอร์โทร"
                    name="tel"
                    type="tel"
                    placeholder="ระบุเบอร์โทรผู้รับผิดชอบ"
                    value={formData.tel}
                    onChange={handlePhoneChange}
                    required
                    maxLength={10}
                    error={errors.tel}
                />
                <FormField
                    label="ระยะเวลาโครงการ"
                    name="timeline"
                    placeholder="เช่น 1 มกราคม 2566 - 31 ธันวาคม 2566"
                    value={formData.timeline}
                    onChange={handleChange}
                    error={errors.timeline}
                    required
                />
                <FormField
                    label="งบประมาณ"
                    name="cost"
                    placeholder="เช่น 500000 บาท (ห้าแสนบาทถ้วน)"
                    value={formData.cost}
                    onChange={handleChange}
                    error={errors.cost}
                    required
                />
            </div>
        </FormSection>
    );
}
