"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

import { PreviewField } from "@/app/(document)/components/PreviewField";
import { PreviewGrid } from "@/app/(document)/components/PreviewField";
import { DocumentEditorLayout } from "@/app/(document)/components/DocumentEditorLayout";
import { useDocumentForm } from "@/app/(document)/hooks/useDocumentForm";
import { usePreviewModal } from "@/app/(document)/hooks/usePreviewModal";
import { useDocumentValidation } from "@/app/(document)/hooks/useDocumentValidation";
import { useExitConfirmation } from "@/app/(document)/hooks/useExitConfirmation";

import {
    type TORData,
    type ActivityData,
    initialTORData,
    initialActivity,
} from "@/config/initialData";
import { type DocumentValidationResult } from "@/lib/validation";
import { ActivitySection } from "./ActivitySection";
import { BasicInfoSection } from "./BasicInfoSection";
import { ProjectDetailSection } from "./ProjectDetailSection";
import { ScopeSection } from "./ScopeSection";

async function validateTorForm(
    data: TORData,
): Promise<DocumentValidationResult<TORData>> {
    return (await import("@/lib/validation/documentValidators/validateTOR"))
        .validateTOR(data);
}

export function TorForm(): React.JSX.Element {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId") || "";

    const [activities, setActivities] = useState<ActivityData[]>([
        { ...initialActivity },
    ]);

    const { isPreviewOpen, openPreview, closePreview, confirmPreview } =
        usePreviewModal();

    const {
        formData,
        setFormData,
        handleChange,
        handleSubmit,
        isSubmitting,
        message,
        isError,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        generatedFileUrl,
    } = useDocumentForm<TORData>({
        initialData: initialTORData,
        apiEndpoint: "/api/generate/tor",
        documentType: "TOR",
        projectId,
        prepareFormData: (_data, formDataObj) => {
            formDataObj.append("activities", JSON.stringify(activities));
        },
    });

    // Use validation hook
    const {
        errors,
        getHandlePreview: handlePreview,
        createPhoneChangeHandler,
        validateBeforeSubmit,
    } = useDocumentValidation<TORData>({
        validateForm: validateTorForm,
        openPreview,
        formData,
    });

    // Create phone change handler
    const handlePhoneChange = createPhoneChangeHandler(
        "tel",
        handleChange,
        () => {},
    );

    const handleRichTextChange = useCallback(
        (name: string, value: string): void => {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        },
        [setFormData],
    );

    // Wrap validateBeforeSubmit
    const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
        validateBeforeSubmit(e, formData, handleSubmit);
    };

    // Activity handlers
    const addActivityRow = (): void => {
        setActivities([...activities, { ...initialActivity }]);
    };

    const removeActivityRow = (index: number): void => {
        if (activities.length > 1) {
            setActivities(activities.filter((_, i) => i !== index));
        }
    };

    const updateActivity = (
        index: number,
        field: keyof ActivityData,
        value: string,
    ): void => {
        const updatedActivities = activities.map((item, i) =>
            i === index ? { ...item, [field]: value } : item,
        );
        setActivities(updatedActivities);
    };

    const isDirty =
        Object.values(formData).some((value) => value !== "") ||
        activities.some(
            (row) =>
                row.activity !== "" ||
                row.manager !== "" ||
                row.evaluation2 !== "" ||
                row.duration !== "",
        );

    const { handleConfirmExit, allowNavigation } = useExitConfirmation({
        isDirty,
    });

    return (
        <DocumentEditorLayout
            title="สร้างเอกสาร Terms of Reference (TOR)"
            subtitle="กรุณากรอกข้อมูลโครงการและกิจกรรมให้ครบถ้วน"
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            onConfirmExit={handleConfirmExit}
            onPreview={handlePreview}
            message={message}
            isError={isError}
            isPreviewOpen={isPreviewOpen}
            onClosePreview={closePreview}
            onConfirmPreview={confirmPreview}
            previewContent={
                <>
                    <PreviewGrid>
                        <PreviewField
                            label="ชื่อไฟล์"
                            value={formData.fileName}
                        />
                        <PreviewField
                            label="ชื่อโครงการ"
                            value={formData.projectName}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField label="วันที่" value={formData.date} />
                        <PreviewField
                            label="เลขที่สัญญา"
                            value={formData.contractnumber}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="ผู้รับผิดชอบ"
                            value={formData.owner}
                        />
                        <PreviewField
                            label="อีเมล"
                            value={formData.email}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="เบอร์โทรศัพท์"
                            value={formData.tel}
                        />
                        <PreviewField
                            label="ที่อยู่"
                            value={formData.address}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="กำหนดเวลา"
                            value={formData.timeline}
                        />
                        <PreviewField
                            label="งบประมาณ"
                            value={formData.cost}
                        />
                    </PreviewGrid>

                    <PreviewField label="หัวข้อ/เรื่อง">
                        <p className="text-sm whitespace-pre-wrap">
                            {formData.topic1 || "-"}
                        </p>
                    </PreviewField>

                    <PreviewField label="วัตถุประสงค์">
                        <p className="text-sm whitespace-pre-wrap">
                            {formData.objective1 || "-"}
                        </p>
                    </PreviewField>

                    <PreviewField label="กลุ่มเป้าหมาย">
                        <p className="text-sm whitespace-pre-wrap">
                            {formData.target || "-"}
                        </p>
                    </PreviewField>

                    <PreviewField label="พื้นที่/เขต">
                        <p className="text-sm whitespace-pre-wrap">
                            {formData.zone || "-"}
                        </p>
                    </PreviewField>

                    <PreviewField label="แผนการดำเนินงาน">
                        <p className="text-sm whitespace-pre-wrap">
                            {formData.plan || "-"}
                        </p>
                    </PreviewField>

                    <PreviewField label="การจัดการโครงการ">
                        <p className="text-sm whitespace-pre-wrap">
                            {formData.projectmanage || "-"}
                        </p>
                    </PreviewField>

                    <PreviewField label="องค์กร ภาคี ร่วมงาน">
                        <p className="text-sm whitespace-pre-wrap">
                            {formData.partner || "-"}
                        </p>
                    </PreviewField>

                    {/* แสดงตารางกิจกรรม */}
                    {activities.length > 0 &&
                        activities.some((a) => a.activity) && (
                            <PreviewField label="ตารางกิจกรรม">
                                <div className="overflow-x-auto mt-2">
                                    <table className="min-w-full text-xs border border-gray-200 dark:border-slate-700">
                                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                                            <tr>
                                                <th className="px-2 py-1 border dark:border-slate-600 text-slate-700 dark:text-slate-200">
                                                    กิจกรรม
                                                </th>
                                                <th className="px-2 py-1 border dark:border-slate-600 text-slate-700 dark:text-slate-200">
                                                    ผู้รับผิดชอบ
                                                </th>
                                                <th className="px-2 py-1 border dark:border-slate-600 text-slate-700 dark:text-slate-200">
                                                    วิธีการประเมิน
                                                </th>
                                                <th className="px-2 py-1 border dark:border-slate-600 text-slate-700 dark:text-slate-200">
                                                    ระยะเวลา
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-600 dark:text-slate-300">
                                            {activities.map(
                                                (activity, index) => (
                                                    <tr key={index}>
                                                        <td className="px-2 py-1 border dark:border-slate-600">
                                                            {activity.activity ||
                                                                "-"}
                                                        </td>
                                                        <td className="px-2 py-1 border dark:border-slate-600">
                                                            {activity.manager ||
                                                                "-"}
                                                        </td>
                                                        <td className="px-2 py-1 border dark:border-slate-600">
                                                            {activity.evaluation2 ||
                                                                "-"}
                                                        </td>
                                                        <td className="px-2 py-1 border dark:border-slate-600">
                                                            {activity.duration ||
                                                                "-"}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </PreviewField>
                        )}
                </>
            }
            isSuccessOpen={isSuccessModalOpen}
            onCloseSuccess={() => setIsSuccessModalOpen(false)}
            fileName={formData.fileName}
            downloadUrl={generatedFileUrl}
            successDocumentType="เอกสาร Word"
            onSuccessRedirect={allowNavigation}
        >
            <BasicInfoSection
                formData={formData}
                handleChange={handleChange}
                handlePhoneChange={handlePhoneChange}
                errors={errors}
            />

            <ProjectDetailSection
                formData={formData}
                handleRichTextChange={handleRichTextChange}
                errors={errors}
            />

            <ScopeSection
                formData={formData}
                handleRichTextChange={handleRichTextChange}
                errors={errors}
            />

            <ActivitySection
                activities={activities}
                addActivityRow={addActivityRow}
                removeActivityRow={removeActivityRow}
                updateActivity={updateActivity}
            />
        </DocumentEditorLayout>
    );
}
