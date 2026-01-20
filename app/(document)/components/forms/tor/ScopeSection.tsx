import { Target } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type TORData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface ScopeSectionProps {
    formData: TORData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    errors: Partial<Record<keyof TORData, string>>;
}

export function ScopeSection({
    formData,
    handleChange,
    errors,
}: ScopeSectionProps): React.JSX.Element {
    return (
        <FormSection
            title="ขอบเขตและการจัดการ"
            bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            borderColor="border-yellow-200 dark:border-yellow-900/50"
            headerBorderColor="border-yellow-300 dark:border-yellow-800"
            icon={
                <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            }
        >
            <div className="space-y-6">
                <FormField
                    label="พื้นที่/เขต"
                    name="zone"
                    type="textarea"
                    placeholder="พื้นที่หรือเขตดำเนินการ"
                    value={formData.zone}
                    onChange={handleChange}
                    error={errors.zone}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="แผนการดำเนินงาน"
                    name="plan"
                    type="textarea"
                    placeholder="แผนการดำเนินงานโครงการ"
                    value={formData.plan}
                    onChange={handleChange}
                    error={errors.plan}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="การจัดการโครงการ"
                    name="projectmanage"
                    type="textarea"
                    placeholder="วิธีการจัดการและบริหารโครงการ"
                    value={formData.projectmanage}
                    onChange={handleChange}
                    error={errors.projectmanage}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="องค์กร ภาคี ร่วมงาน"
                    name="partner"
                    type="textarea"
                    placeholder="องค์กร ภาค ร่วมงาน"
                    value={formData.partner}
                    error={errors.partner}
                    onChange={handleChange}
                    rows={6}
                    className="h-40"
                />
            </div>
        </FormSection>
    );
}
