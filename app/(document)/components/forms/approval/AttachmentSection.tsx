import { Folder } from "lucide-react";
import {
    AttachmentList,
    AttachmentUpload,
    FormSection,
} from "@/app/(document)/components";
import { type ApprovalData } from "@/config/initialData";
import { type ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";

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

                <div className="group">
                    <div className="flex items-center justify-between mb-2 ml-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            เนื้อหา <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            รูปแบบการพิมพ์เอกสาร
                        </span>
                    </div>

                    <div className="relative rounded-2xl border border-slate-300/80 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                        <div className="absolute left-10 top-0 bottom-0 w-px bg-rose-200/80 dark:bg-rose-400/30 pointer-events-none" />
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage:
                                    "repeating-linear-gradient(to bottom, transparent, transparent 35px, rgba(148,163,184,0.14) 36px)",
                            }}
                        />
                        <Textarea
                            name="detail"
                            placeholder="รายละเอียดเนื้อหา"
                            value={formData.detail}
                            onChange={handleChange}
                            constrainToA4={false}
                            rows={14}
                            className="relative z-10 min-h-[420px] h-[420px] rounded-none border-0 bg-transparent px-14 py-8 focus-visible:ring-0 focus-visible:border-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    {errors.detail && (
                        <p className="text-sm text-red-500 dark:text-red-400 mt-1 ml-1">
                            {errors.detail}
                        </p>
                    )}
                </div>
            </div>
        </FormSection>
    );
}
