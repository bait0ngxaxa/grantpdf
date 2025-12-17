"use client";

import { useState, useCallback } from "react";

interface UsePreviewModalReturn {
    isPreviewOpen: boolean;
    openPreview: () => void;
    closePreview: () => void;
    confirmPreview: () => void;
}

export function usePreviewModal(): UsePreviewModalReturn {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const openPreview = useCallback(() => {
        setIsPreviewOpen(true);
    }, []);

    const closePreview = useCallback(() => {
        setIsPreviewOpen(false);
    }, []);

    const confirmPreview = useCallback(() => {
        setIsPreviewOpen(false);

        const form = document.querySelector("form");
        if (form) {
            form.requestSubmit();
        }
    }, []);

    return {
        isPreviewOpen,
        openPreview,
        closePreview,
        confirmPreview,
    };
}
