"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePreventNavigation } from "./usePreventNavigation";

interface UseExitConfirmationOptions {
    isDirty: boolean;
    exitPath?: string;
}

interface UseExitConfirmationReturn {
    isExitModalOpen: boolean;
    setIsExitModalOpen: (open: boolean) => void;
    handleConfirmExit: () => void;
    allowNavigation: () => void;
}

export function useExitConfirmation({
    isDirty,
    exitPath = "/createdocs",
}: UseExitConfirmationOptions): UseExitConfirmationReturn {
    const router = useRouter();
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);

    const { allowNavigation } = usePreventNavigation({
        isDirty,
        onNavigationAttempt: () => setIsExitModalOpen(true),
    });

    const handleConfirmExit = useCallback(() => {
        allowNavigation();
        setIsExitModalOpen(false);
        setTimeout(() => {
            router.push(exitPath);
        }, 100);
    }, [allowNavigation, router, exitPath]);

    return {
        isExitModalOpen,
        setIsExitModalOpen,
        handleConfirmExit,
        allowNavigation,
    };
}
