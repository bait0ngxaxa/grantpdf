import { User } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type ContractData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface ContractorInfoSectionProps {
    formData: ContractData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    handleCitizenIdChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof ContractData, string>>;
}

export function ContractorInfoSection({
    formData,
    handleChange,
    handleCitizenIdChange,
    errors,
}: ContractorInfoSectionProps) {
    return (
        <FormSection
            title="ข้อมูลผู้รับจ้าง"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            headerBorderColor="border-purple-300"
            icon={<User className="w-5 h-5 text-purple-600" />}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                    label="ชื่อผู้รับจ้าง"
                    name="name"
                    placeholder="ระบุชื่อผู้รับจ้าง"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                />
                <FormField
                    label="ที่อยู่"
                    name="address"
                    placeholder="ระบุที่อยู่ติดต่อผู้รับจ้าง"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    required
                />
                <FormField
                    label="บัตรประชาชนเลขที่"
                    name="citizenid"
                    type="tel"
                    placeholder="ระบุเลขบัตรประชาชน 13 หลักผู้รับจ้าง"
                    value={formData.citizenid}
                    onChange={handleCitizenIdChange}
                    required
                    maxLength={13}
                    error={errors.citizenid}
                />
                <FormField
                    label="วันหมดอายุบัตรประชาชน"
                    name="citizenexpire"
                    placeholder="ระบุวันหมดอายุ ตัวอย่าง 31 ธันวาคม 2568"
                    value={formData.citizenexpire}
                    onChange={handleChange}
                    error={errors.citizenexpire}
                    required
                />
                <FormField
                    label="ชื่อพยาน"
                    name="witness"
                    placeholder="ระบุชื่อ-นามสกุล พยาน"
                    value={formData.witness}
                    onChange={handleChange}
                    error={errors.witness}
                    required
                />
            </div>
        </FormSection>
    );
}
