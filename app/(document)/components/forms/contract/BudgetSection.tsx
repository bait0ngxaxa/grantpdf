import { Calculator } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type ContractData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface BudgetSectionProps {
    formData: ContractData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof ContractData, string>>;
}

export function BudgetSection({
    formData,
    handleChange,
    errors,
}: BudgetSectionProps): React.JSX.Element {
    return (
        <FormSection
            title="ข้อมูลงบประมาณ ระยะเวลา จำนวนงวด"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            headerBorderColor="border-blue-300"
            icon={<Calculator className="w-5 h-5 text-blue-600" />}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                    label="งบประมาณ"
                    name="cost"
                    placeholder="ตัวอย่าง : 500,000 บาท (ห้าแสนบาทถ้วน)"
                    value={formData.cost}
                    onChange={handleChange}
                    error={errors.cost}
                    required
                />
                <FormField
                    label="ระยะเวลา (เดือน)"
                    name="timelineMonth"
                    type="number"
                    placeholder="ระบุตัวเลข เช่น 12 (ใส่เฉพาะตัวเลข)"
                    value={formData.timelineMonth}
                    onChange={handleChange}
                    error={errors.timelineMonth}
                    required
                />
                <FormField
                    label="เริ่มตั้งแต่"
                    name="timelineText"
                    placeholder="ตัวอย่าง : 1 มกราคม 2568 ถึง 31 ธันวาคม 2568"
                    value={formData.timelineText}
                    onChange={handleChange}
                    error={errors.timelineText}
                    required
                />
                <FormField
                    label="จำนวนงวด"
                    name="section"
                    type="number"
                    placeholder="ระบุเลขจำนวนงวด เช่น 3 (ใส่เฉพาะตัวเลข)"
                    value={formData.section}
                    onChange={handleChange}
                    error={errors.section}
                    required
                />
            </div>
        </FormSection>
    );
}
