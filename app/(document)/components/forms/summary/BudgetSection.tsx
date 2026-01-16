import { Calculator } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type SummaryData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface BudgetSectionProps {
    formData: SummaryData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof SummaryData, string>>;
}

export function BudgetSection({
    formData,
    handleChange,
    errors,
}: BudgetSectionProps): React.JSX.Element {
    return (
        <FormSection
            title="ข้อมูลงบประมาณ"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            headerBorderColor="border-green-300"
            icon={<Calculator className="w-5 h-5 text-green-600" />}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                    label="งวด 1"
                    name="sec1"
                    type="number"
                    placeholder="ระบุจำนวนเงินงวด 1 (ตัวเลข)"
                    value={formData.sec1}
                    onChange={handleChange}
                    error={errors.sec1}
                />
                <FormField
                    label="งวด 2"
                    name="sec2"
                    type="number"
                    placeholder="ระบุจำนวนเงินงวด 2 (ตัวเลข)"
                    value={formData.sec2}
                    onChange={handleChange}
                    error={errors.sec2}
                />
                <FormField
                    label="งวด 3"
                    name="sec3"
                    type="number"
                    placeholder="ระบุจำนวนเงินงวด 3 (ตัวเลข)"
                    value={formData.sec3}
                    onChange={handleChange}
                    error={errors.sec3}
                />
                <FormField
                    label="รวม"
                    name="sum"
                    type="number"
                    placeholder="ระบุจำนวนเงินรวม (ตัวเลข)"
                    value={formData.sum}
                    onChange={handleChange}
                    error={errors.sum}
                />
                <FormField
                    label="แหล่งทุน"
                    name="funds"
                    placeholder="ระบุแหล่งทุน"
                    value={formData.funds}
                    onChange={handleChange}
                    error={errors.funds}
                />
            </div>
        </FormSection>
    );
}
