"use client";

import { useCreateDocsContext } from "./contexts";

import {
    ProjectSelection,
    MainMenu,
    ContractTypeSubmenu,
    CategorySubmenu,
} from "./components";

export default function CreateDocsClient(): React.JSX.Element | null {
    const { currentStep, selectedContractType } = useCreateDocsContext();

    const content =
        currentStep === "select-project" ? (
            <ProjectSelection />
        ) : currentStep === "select-category" ? (
            <MainMenu />
        ) : selectedContractType ? (
            <ContractTypeSubmenu />
        ) : (
            <CategorySubmenu />
        );

    return (
        <div className="w-full">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {content}
            </div>
        </div>
    );
}
