import { type ReactNode, type FormEvent } from "react";
import {
    PageLayout,
    FormActions,
    PreviewModal,
    ErrorAlert,
} from "@/app/(document)/components";
import { CreateDocSuccessModal } from "@/components/ui";

interface DocumentEditorLayoutProps {
    // Page Config
    title: string;
    subtitle?: string;

    // Form Logic
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isSubmitting: boolean;
    isDirty: boolean;
    onConfirmExit: () => void;
    onPreview: () => void;

    // Feedback
    message: string | null;
    isError: boolean;

    // Preview Modal
    isPreviewOpen: boolean;
    onClosePreview: () => void;
    onConfirmPreview: () => void;
    previewContent: ReactNode;
    previewErrorMessage?: string;

    // Success Modal
    isSuccessOpen: boolean;
    onCloseSuccess: () => void;
    fileName?: string;
    downloadUrl: string | null;
    successDocumentType?: string;
    onSuccessRedirect: () => void;

    // Content
    children: ReactNode;
}

export function DocumentEditorLayout({
    title,
    subtitle,
    onSubmit,
    isSubmitting,
    isDirty,
    onConfirmExit,
    onPreview,
    message,
    isError,
    isPreviewOpen,
    onClosePreview,
    onConfirmPreview,
    previewContent,
    previewErrorMessage,
    isSuccessOpen,
    onCloseSuccess,
    fileName,
    downloadUrl,
    successDocumentType = "เอกสาร",
    onSuccessRedirect,
    children,
}: DocumentEditorLayoutProps): React.JSX.Element {
    return (
        <PageLayout
            title={title}
            subtitle={subtitle}
            isDirty={isDirty}
            onConfirmExit={onConfirmExit}
        >
            <form onSubmit={onSubmit} className="space-y-8">
                {children}

                <FormActions
                    onPreview={onPreview}
                    isSubmitting={isSubmitting}
                />
            </form>

            <ErrorAlert message={message} isError={isError} />

            {/* Preview Modal */}
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={onClosePreview}
                onConfirm={onConfirmPreview}
                errorMessage={previewErrorMessage}
            >
                {previewContent}
            </PreviewModal>

            {/* Success Modal */}
            <CreateDocSuccessModal
                isOpen={isSuccessOpen}
                onClose={onCloseSuccess}
                fileName={fileName || "เอกสาร"}
                downloadUrl={downloadUrl}
                documentType={successDocumentType || "เอกสาร"}
                onRedirect={onSuccessRedirect}
            />
        </PageLayout>
    );
}
