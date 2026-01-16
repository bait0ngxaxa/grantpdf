import { UserPen } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type ApprovalData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface ApproverInfoSectionProps {
    formData: ApprovalData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    handlePhoneChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof ApprovalData, string>>;
}

export function ApproverInfoSection({
    formData,
    handleChange,
    handlePhoneChange,
    errors,
}: ApproverInfoSectionProps) {
    return (
        <>
            {/* ข้อมูลผู้ขออนุมัติ */}
            <FormSection
                title="ข้อมูลผู้ขออนุมัติ"
                bgColor="bg-purple-50"
                borderColor="border-purple-200"
                headerBorderColor="border-purple-300"
                icon={<UserPen className="w-5 h-5 text-purple-600" />}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField
                        label="ชื่อผู้ขออนุมัติ"
                        name="name"
                        placeholder="ระบุชื่อ-นามสกุลผู้ขออนุมัติ"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                    />
                    <FormField
                        label="ตำแหน่ง/แผนก"
                        name="depart"
                        placeholder="ระบุตำแหน่ง/แผนกผู้ขออนุมัติ"
                        value={formData.depart}
                        onChange={handleChange}
                        error={errors.depart}
                        required
                    />
                    <FormField
                        label="ผู้ประสานงาน"
                        name="coor"
                        placeholder="ระบุชื่อ-นามสกุลผู้ประสานงาน"
                        value={formData.coor}
                        onChange={handleChange}
                        error={errors.coor}
                        required
                    />
                    <FormField
                        label="เบอร์โทรศัพท์"
                        name="tel"
                        type="tel"
                        placeholder="ระบุเบอร์โทรศัพท์ผู้ประสานงาน"
                        value={formData.tel}
                        onChange={handlePhoneChange}
                        required
                        maxLength={10}
                        error={errors.tel}
                    />
                    <div className="lg:col-span-2">
                        <FormField
                            label="อีเมล"
                            name="email"
                            type="email"
                            placeholder="ระบุอีเมลผู้ประสานงาน"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            required
                        />
                    </div>
                </div>
            </FormSection>

            {/* ข้อมูลผู้อนุมัติ */}
            <FormSection
                title="ข้อมูลผู้ลงนามอนุมัติ"
                bgColor="bg-red-50"
                borderColor="border-red-200"
                headerBorderColor="border-red-300"
                icon={<UserPen className="w-5 h-5 text-red-600" />}
            >
                <FormField
                    label="ชื่อผู้อนุมัติ"
                    name="accept"
                    placeholder="ระบุชื่อ-นามสกุลผู้อนุมัติ"
                    value={formData.accept}
                    onChange={handleChange}
                    error={errors.accept}
                    required
                />
            </FormSection>
        </>
    );
}
