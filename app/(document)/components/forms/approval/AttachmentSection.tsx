import { Folder } from "lucide-react";
import { AttachmentList } from "@/app/(document)/components/document-form/AttachmentList";
import { AttachmentUpload } from "@/app/(document)/components/document-form/AttachmentUpload";
import { FormSection } from "@/app/(document)/components/document-form/FormSection";
import { RichTextField } from "@/app/(document)/components/document-form/RichTextField";
import { type ApprovalData } from "@/config/initialData";
import { type ChangeEvent } from "react";
import { DOCUMENT_TEXTAREA_MAX_LENGTH } from "@/lib/validation/constants";

interface AttachmentSectionProps {
    formData: ApprovalData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
}: AttachmentSectionProps): React.JSX.Element {
    const handleRichTextChange = (name: string, value: string): void => {
        const target = { name, value } as HTMLTextAreaElement;
        handleChange({ target } as ChangeEvent<HTMLTextAreaElement>);
    };

    return (
        <FormSection
            title="สิ่งที่ส่งมาด้วยและเนื้อหา"
            bgColor="bg-green-50 dark:bg-green-900/20"
            borderColor="border-green-200 dark:border-green-900/50"
            headerBorderColor="border-green-300 dark:border-green-800"
            icon={
                <Folder className="w-5 h-5 text-green-600 dark:text-green-400" />
            }
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

                <RichTextField
                    label="เนื้อหา"
                    name="detail"
                    placeholder="รายละเอียดเนื้อหา"
                    value={formData.detail}
                    onValueChange={handleRichTextChange}
                    required
                    maxLength={DOCUMENT_TEXTAREA_MAX_LENGTH}
                    error={errors.detail}
                    className="h-[420px]"
                />
            </div>
        </FormSection>
    );
}
