import { FileText } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type FormProjectData } from "@/config/initialData";
import {
    DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH,
    DOCUMENT_TEXTAREA_MAX_LENGTH,
    DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH,
} from "@/lib/validation/schemas";
import { type ChangeEvent } from "react";

interface ProjectDetailSectionProps {
    formData: FormProjectData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
            bgColor="bg-green-50 dark:bg-green-900/20"
            borderColor="border-green-200 dark:border-green-900/50"
            headerBorderColor="border-green-300 dark:border-green-800"
            icon={
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            }
        >
            <div className="space-y-6">
                <FormField
                    label="ความเป็นมาและแนวคิดการจัดโครงการ"
                    name="rationale"
                    type="textarea"
                    constrainToA4={false}
                    placeholder="ระบุเหตุผลความจำเป็นในการดำเนินโครงการ"
                    value={formData.rationale}
                    onChange={handleChange}
                    maxLength={DOCUMENT_TEXTAREA_MAX_LENGTH}
                    error={errors.rationale}
                    rows={12}
                    className="h-96"
                />
                <FormField
                    label="เป้าประสงค์"
                    name="goal"
                    type="textarea"
                    constrainToA4={false}
                    placeholder="ระบุเป้าประสงค์โครงการ"
                    value={formData.goal}
                    onChange={handleChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.goal}
                    rows={4}
                    className="h-30"
                />
                <FormField
                    label="วัตถุประสงค์"
                    name="objective"
                    type="textarea"
                    constrainToA4={false}
                    placeholder="ระบุวัตถุประสงค์โครงการ"
                    value={formData.objective}
                    onChange={handleChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.objective}
                    rows={4}
                    className="h-30"
                />
                <FormField
                    label="เป้าหมายโครงการ"
                    name="target"
                    type="textarea"
                    constrainToA4={false}
                    placeholder="ระบุเป้าหมายโครงการ"
                    value={formData.target}
                    onChange={handleChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.target}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="กรอบการดำเนินงาน"
                    name="scope"
                    type="textarea"
                    constrainToA4={false}
                    placeholder="ระบุกรอบการดำเนินงาน"
                    value={formData.scope}
                    onChange={handleChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.scope}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="ผลผลิต"
                    name="product"
                    type="textarea"
                    constrainToA4={false}
                    placeholder="ระบุผลผลิตโครงการ"
                    value={formData.product}
                    onChange={handleChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.product}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="ผลลัพธ์"
                    name="result"
                    type="textarea"
                    constrainToA4={false}
                    placeholder="ระบุผลลัพธ์โครงการ"
                    value={formData.result}
                    onChange={handleChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.result}
                    rows={6}
                    className="h-40"
                />
                <FormField
                    label="ประวัติผู้ช่วยวิทยากรกระบวนการถอดบทเรียน"
                    name="author"
                    type="textarea"
                    constrainToA4={false}
                    placeholder="กรอกประวัติส่วนตัว"
                    value={formData.author}
                    onChange={handleChange}
                    maxLength={DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH}
                    error={errors.author}
                    rows={6}
                    className="h-40"
                />
            </div>
        </FormSection>
    );
}
