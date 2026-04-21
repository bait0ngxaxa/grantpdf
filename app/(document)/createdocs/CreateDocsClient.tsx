"use client";

import { useCreateDocsContext } from "./contexts";

import {
    ProjectSelection,
    MainMenu,
    ContractTypeSubmenu,
    CategorySubmenu,
} from "./components";

export default function CreateDocsClient(): React.JSX.Element | null {
    const { selectedProjectId, selectedCategory, selectedContractType } =
        useCreateDocsContext();

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
