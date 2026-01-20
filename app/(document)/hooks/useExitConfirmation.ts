import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreventNavigation } from "./usePreventNavigation";
import { useGlobalModal } from "@/lib/hooks/useGlobalModal";

interface UseExitConfirmationOptions {
    isDirty: boolean;
    exitPath?: string;
}

interface UseExitConfirmationReturn {
    // No longer need isExitModalOpen and setIsExitModalOpen exposed,
    // unless used for something else. But typically consumers just passed these to the modal.
    // I will keep them compatible BUT empty/unused or remove them if safe.
    // Looking at TorForm: it passes `isExitModalOpen` and `setIsExitModalOpen` to `PageLayout`.
    // I should probably return them as dummies OR update TorForm to not need them.
    // For cleaner refactor, I will update TorForm to NOT need/render the modal.
    // So I will change the return type.
    handleConfirmExit: () => void;
    allowNavigation: () => void;
}

export function useExitConfirmation({
    isDirty,
    exitPath = "/createdocs",
}: UseExitConfirmationOptions): UseExitConfirmationReturn {
    const router = useRouter();
    const { showConfirm } = useGlobalModal();

    // Use a ref to store the confirm handler to avoid circular dependency with usePreventNavigation
    const confirmExitRef = useRef<() => void>(() => {});

    const { allowNavigation } = usePreventNavigation({
        isDirty,
        onNavigationAttempt: () => {
            showConfirm({
                title: "คุณแน่ใจหรือไม่?",
                description:
                    "ข้อมูลที่คุณกรอกยังไม่ได้บันทึก หากออกจากหน้านี้ข้อมูลจะสูญหาย",
                confirmText: "ตกลง",
                cancelText: "ยกเลิก",
                isDestructive: true,
                onConfirm: () => confirmExitRef.current(),
            });
        },
    });

    const handleConfirmExit = useCallback(() => {
        allowNavigation();
        setTimeout(() => {
            router.push(exitPath);
        }, 100);
    }, [allowNavigation, router, exitPath]);

    // Update the ref with the real handler
    useEffect(() => {
        confirmExitRef.current = handleConfirmExit;
    }, [handleConfirmExit]);

    return {
        handleConfirmExit,
        allowNavigation,
    };
}
