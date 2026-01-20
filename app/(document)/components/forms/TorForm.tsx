"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTitle } from "@/lib/hooks/useTitle";

import {
    PreviewField,
    PreviewGrid,
    DocumentEditorLayout,
} from "@/app/(document)/components";
import { LoadingSpinner } from "@/components/ui";
import {
    useDocumentForm,
    usePreviewModal,
    useDocumentValidation,
    useExitConfirmation,
} from "@/app/(document)/hooks";

import {
    type TORData,
    type ActivityData,
    initialTORData,
    initialActivity,
} from "@/config/initialData";
import { validateTOR } from "@/lib/validation";
import {
    BasicInfoSection,
    ProjectDetailSection,
    ScopeSection,
    ActivitySection,
} from "@/app/(document)/components/forms/tor";

export function TorForm(): React.JSX.Element {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId") || "";

    useTitle("สร้างเอกสาร TOR | ระบบจัดการเอกสาร");

    const [activities, setActivities] = useState<ActivityData[]>([
        { ...initialActivity },
    ]);

    const { isPreviewOpen, openPreview, closePreview, confirmPreview } =
        usePreviewModal();

    const {
        formData,
        handleChange,
        handleSubmit,
        isSubmitting,
        message,
        isError,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        generatedFileUrl,
        isClient,
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
        validateForm: validateTOR,
        openPreview,
        formData,
        phoneFields: ["tel"],
        emailFields: ["email"],
    });

    // Create phone change handler
    const handlePhoneChange = createPhoneChangeHandler(
        "tel",
        handleChange,
        () => {},
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

    if (!isClient) {
        return <LoadingSpinner />;
    }

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
                            label="ชื่อโครงการ"
                            value={formData.projectName}
                        />
                        <PreviewField label="วันที่" value={formData.date} />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="เลขที่สัญญา"
                            value={formData.contractnumber}
                        />
                        <PreviewField
                            label="ผู้รับผิดชอบ"
                            value={formData.owner}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="ที่อยู่"
                            value={formData.address}
                        />
                        <PreviewField
                            label="กำหนดเวลา"
                            value={formData.timeline}
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
                handleChange={handleChange}
                errors={errors}
            />

            <ScopeSection
                formData={formData}
                handleChange={handleChange}
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
