import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PreviewModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    previewUrl: string;
    previewTitle: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
    isModalOpen,
    setIsModalOpen,
    previewUrl,
    previewTitle,
}) => {
    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-5xl h-[90vh] p-0 rounded-3xl bg-white border-0 shadow-2xl flex flex-col">
                <DialogHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-bold text-slate-800 truncate pr-8">
                        พรีวิว:{" "}
                        <span className="text-blue-600">{previewTitle}</span>
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </Button>
                </DialogHeader>
                <div className="flex-1 bg-slate-50 relative rounded-b-3xl overflow-hidden">
                    <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="Document Preview"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
