"use client";

import { LoadingSpinner } from "@/components/ui";
import { useTitle } from "@/lib/hooks/useTitle";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCreateDocsContext } from "./CreateDocsContext";

import {
    ProjectSelection,
    MainMenu,
    ContractTypeSubmenu,
    CategorySubmenu,
} from "./components";

export default function CreateDocsPage(): React.JSX.Element | null {
    const router = useRouter();
    const { status } = useSession();
    const { selectedProjectId, selectedCategory, selectedContractType } =
        useCreateDocsContext();

    useTitle("เลือกเอกสารที่สร้าง | ระบบจัดการเอกสาร");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(ROUTES.SIGNIN);
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="w-full">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Conditional rendering based on selected state */}
                {!selectedProjectId ? (
                    <ProjectSelection />
                ) : selectedContractType ? (
                    <ContractTypeSubmenu />
                ) : selectedCategory ? (
                    <CategorySubmenu />
                ) : (
                    <MainMenu />
                )}
            </div>
        </div>
    );
}
