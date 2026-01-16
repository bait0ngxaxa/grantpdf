import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export interface UseNavigationProps {
    selectedProjectId: string | null;
}

export interface UseNavigationReturn {
    handleBack: (
        selectedContractType: string | null,
        selectedProjectId: string | null,
        selectedCategory: string | null,
        setSelectedContractType: (type: string | null) => void,
        setSelectedProjectId: (id: string | null) => void,
        setSelectedCategory: (category: string | null) => void
    ) => void;
    handleCategorySelection: (
        category: string,
        isAdmin: boolean,
        setSelectedCategory: (category: string | null) => void
    ) => void;
    handleApprovalSelection: () => void;
    handleContractSelection: (contractCode?: string) => void;
    handleFormProjectSelection: () => void;
    handleSummarySelection: () => void;
    handleTorSelection: () => void;
}

export const useNavigation = ({
    selectedProjectId,
}: UseNavigationProps): UseNavigationReturn => {
    const router = useRouter();

    const handleBack = (
        selectedContractType: string | null,
        selectedProjectId: string | null,
        selectedCategory: string | null,
        setSelectedContractType: (type: string | null) => void,
        setSelectedProjectId: (id: string | null) => void,
        setSelectedCategory: (category: string | null) => void
    ) => {
        if (selectedContractType) {
            setSelectedContractType(null);
        } else if (selectedProjectId) {
            setSelectedProjectId(null);
        } else if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            router.push(ROUTES.DASHBOARD);
        }
    };

    const handleCategorySelection = (
        category: string,
        isAdmin: boolean,
        setSelectedCategory: (category: string | null) => void
    ) => {
        if (category === "general" && !isAdmin) {
            setSelectedCategory("project");
            return;
        }
        setSelectedCategory(category);
    };

    const handleApprovalSelection = () => {
        if (!selectedProjectId) {
            console.error("No project selected");
            return;
        }
        router.push(
            `/create-word/approval?projectId=${encodeURIComponent(
                selectedProjectId
            )}`
        );
    };

    const handleContractSelection = (contractCode?: string) => {
        if (!selectedProjectId) {
            console.error("No project selected");
            return;
        }
        const params = new URLSearchParams({ projectId: selectedProjectId });
        if (contractCode) {
            params.set("contractCode", contractCode);
        }
        router.push(`/create-word/contract?${params.toString()}`);
    };

    const handleFormProjectSelection = () => {
        if (!selectedProjectId) {
            console.error("No project selected");
            return;
        }
        router.push(
            `/create-word/formproject?projectId=${encodeURIComponent(
                selectedProjectId
            )}`
        );
    };

    const handleSummarySelection = () => {
        if (!selectedProjectId) {
            console.error("No project selected");
            return;
        }
        router.push(
            `/create-word/summary?projectId=${encodeURIComponent(
                selectedProjectId
            )}`
        );
    };

    const handleTorSelection = () => {
        if (!selectedProjectId) {
            console.error("No project selected");
            return;
        }
        router.push(
            `/create-word/tor?projectId=${encodeURIComponent(
                selectedProjectId
            )}`
        );
    };

    return {
        handleBack,
        handleCategorySelection,
        handleApprovalSelection,
        handleContractSelection,
        handleFormProjectSelection,
        handleSummarySelection,
        handleTorSelection,
    };
};
