"use client";

import React, {
    createContext,
    useContext,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useCreateDocsState } from "../hooks";
import { ROUTES } from "@/lib/constants";

interface CreateDocsUIContextType {
    // State
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
    selectedContractType: string | null;
    setSelectedContractType: (type: string | null) => void;
    isAdmin: boolean;

    // Actions
    goBack: () => void;
    handleCategorySelection: (category: string) => void;
    handleApprovalSelection: () => void;
    handleContractSelection: (contractCode?: string) => void;
    handleFormProjectSelection: () => void;
    handleSummarySelection: () => void;
    handleTorSelection: () => void;
}

const CreateDocsUIContext = createContext<CreateDocsUIContextType | undefined>(
    undefined,
);

export function CreateDocsUIProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const {
        selectedCategory,
        setSelectedCategory,
        selectedContractType,
        setSelectedContractType,
        selectedProjectId,
        setSelectedProjectId,
        isAdmin,
    } = useCreateDocsState();

    // Navigation Actions
    const goBack = useCallback(() => {
        if (selectedContractType) {
            setSelectedContractType(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else if (selectedProjectId) {
            setSelectedProjectId(null);
        } else {
            router.push(ROUTES.DASHBOARD);
        }
    }, [
        selectedContractType,
        selectedCategory,
        selectedProjectId,
        setSelectedContractType,
        setSelectedCategory,
        setSelectedProjectId,
        router,
    ]);

    const handleCategorySelection = useCallback(
        (category: string) => {
            if (category === "general" && !isAdmin) {
                setSelectedCategory("project");
                return;
            }
            setSelectedCategory(category);
        },
        [isAdmin, setSelectedCategory],
    );

    const handleApprovalSelection = useCallback((): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/approval?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    }, [selectedProjectId, router]);

    const handleContractSelection = useCallback(
        (contractCode?: string): void => {
            if (!selectedProjectId) return;
            const params = new URLSearchParams({
                projectId: selectedProjectId,
            });
            if (contractCode) {
                params.set("contractCode", contractCode);
            }
            router.push(`/create-word/contract?${params.toString()}`);
        },
        [selectedProjectId, router],
    );

    const handleFormProjectSelection = useCallback((): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/formproject?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    }, [selectedProjectId, router]);

    const handleSummarySelection = useCallback((): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/summary?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    }, [selectedProjectId, router]);

    const handleTorSelection = useCallback((): void => {
        if (!selectedProjectId) return;
        router.push(
            `/create-word/tor?projectId=${encodeURIComponent(selectedProjectId)}`,
        );
    }, [selectedProjectId, router]);

    const value = useMemo(
        () => ({
            selectedProjectId,
            setSelectedProjectId,
            selectedCategory,
            setSelectedCategory,
            selectedContractType,
            setSelectedContractType,
            isAdmin,
            goBack,
            handleCategorySelection,
            handleApprovalSelection,
            handleContractSelection,
            handleFormProjectSelection,
            handleSummarySelection,
            handleTorSelection,
        }),
        [
            selectedProjectId,
            setSelectedProjectId,
            selectedCategory,
            setSelectedCategory,
            selectedContractType,
            setSelectedContractType,
            isAdmin,
            goBack,
            handleCategorySelection,
            handleApprovalSelection,
            handleContractSelection,
            handleFormProjectSelection,
            handleSummarySelection,
            handleTorSelection,
        ],
    );

    return (
        <CreateDocsUIContext.Provider value={value}>
            {children}
        </CreateDocsUIContext.Provider>
    );
}

export function useCreateDocsUI() {
    const context = useContext(CreateDocsUIContext);
    if (context === undefined) {
        throw new Error(
            "useCreateDocsUI must be used within a CreateDocsUIProvider",
        );
    }
    return context;
}
