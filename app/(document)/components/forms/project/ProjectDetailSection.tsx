import { FileText } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type FormProjectData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface ProjectDetailSectionProps {
    formData: FormProjectData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof FormProjectData, string>>;
}

export function ProjectDetailSection({
    formData,
    handleChange,
    errors,
}: ProjectDetailSectionProps): React.JSX.Element {
    return (
        <FormSection
            title="รายละเอียดโครงการ"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            headerBorderColor="border-green-300"
            icon={<FileText className="w-5 h-5 text-green-600" />}
        >
            <div className="space-y-6">
                <FormField
                    label="ความเป็นมาและแนวคิดการจัดโครงการ"
                    name="rationale"
                    type="textarea"
                    placeholder="ระบุเหตุผลความจำเป็นในการดำเนินโครงการ"
                    value={formData.rationale}
                    onChange={handleChange}
                    error={errors.rationale}
                    rows={12}
                    className="h-96"
                />
                <FormField
                    label="เป้าประสงค์"
                    name="goal"
                    type="textarea"
                    placeholder="ระบุเป้าประสงค์โครงการ"
                    value={formData.goal}
                    onChange={handleChange}
                    error={errors.goal}
                    rows={4}
                    className="h-30"
                />
                <FormField
                    label="วัตถุประสงค์"
                    name="objective"
                    type="textarea"
                    placeholder="ระบุวัตถุประสงค์โครงการ"
                    value={formData.objective}
                    onChange={handleChange}
                    error={errors.objective}
                    rows={4}
                    className="h-30"
                />
                <FormField
                    label="เป้าหมายโครงการ"
                    name="target"
                    type="textarea"
                    placeholder="ระบุเป้าหมายโครงการ"
                    value={formData.target}
                    onChange={handleChange}
                    error={errors.target}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="กรอบการดำเนินงาน"
                    name="scope"
                    type="textarea"
                    placeholder="ระบุกรอบการดำเนินงาน"
                    value={formData.scope}
                    onChange={handleChange}
                    error={errors.scope}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="ผลผลิต"
                    name="product"
                    type="textarea"
                    placeholder="ระบุผลผลิตโครงการ"
                    value={formData.product}
                    onChange={handleChange}
                    error={errors.product}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="ผลลัพธ์"
                    name="result"
                    type="textarea"
                    placeholder="ระบุผลลัพธ์โครงการ"
                    value={formData.result}
                    onChange={handleChange}
                    error={errors.result}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="ประวัติผู้ช่วยวิทยากรกระบวนการถอดบทเรียน"
                    name="author"
                    type="textarea"
                    placeholder="กรอกประวัติส่วนตัว"
                    value={formData.author}
                    onChange={handleChange}
                    error={errors.author}
                    rows={6}
                    className="h-40"
                />
            </div>
        </FormSection>
    );
}
