import { Folder } from "lucide-react";
import {
    AttachmentList,
    AttachmentUpload,
    FormField,
    FormSection,
} from "@/app/(document)/components";
import { type ApprovalData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface AttachmentSectionProps {
    formData: ApprovalData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof ApprovalData, string>>;
    attachmentFiles: File[];
    handleAttachmentFilesChange: (e: ChangeEvent<HTMLInputElement>) => void;
    removeAttachmentFile: (index: number) => void;
    addAttachment: () => void;
    removeAttachment: (index: number) => void;
    updateAttachment: (index: number, value: string) => void;
}

export function AttachmentSection({
    formData,
    handleChange,
    errors,
    attachmentFiles,
    handleAttachmentFilesChange,
    removeAttachmentFile,
    addAttachment,
    removeAttachment,
    updateAttachment,
}: AttachmentSectionProps) {
    return (
        <FormSection
            title="สิ่งที่ส่งมาด้วยและเนื้อหา"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            headerBorderColor="border-green-300"
            icon={<Folder className="w-5 h-5 text-green-600" />}
        >
            <div className="space-y-6">
                <AttachmentList
                    attachments={formData.attachments}
                    onAdd={addAttachment}
                    onRemove={removeAttachment}
                    onUpdate={updateAttachment}
                />

                {formData.attachments.length > 0 && (
                    <AttachmentUpload
                        files={attachmentFiles}
                        onFilesChange={handleAttachmentFilesChange}
                        onRemoveFile={removeAttachmentFile}
                    />
                )}

                <FormField
                    label="เนื้อหา"
                    name="detail"
                    type="textarea"
                    placeholder="รายละเอียดเนื้อหา"
                    value={formData.detail}
                    onChange={handleChange}
                    error={errors.detail}
                    rows={12}
                    className="h-96"
                />
            </div>
        </FormSection>
    );
}
