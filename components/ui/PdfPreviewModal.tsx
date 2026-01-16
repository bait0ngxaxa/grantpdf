import React from "react";
import { File, X } from "lucide-react";

interface PdfPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    previewUrl: string;
    previewFileName: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
    isOpen,
    onClose,
    previewUrl,
    previewFileName,
}) => {
    return (
        <>
            {isOpen && (
                <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/40">
                    <div className="modal-box w-11/12 max-w-6xl h-[90vh] bg-white p-0 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center p-4 px-6 border-b border-slate-100 bg-white z-10">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500 flex-shrink-0">
                                    <File className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 truncate">
                                    {previewFileName}
                                </h3>
                            </div>
                            <button
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                onClick={onClose}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-50 relative">
                            <iframe
                                src={previewUrl}
                                width="100%"
                                height="100%"
                                style={{ border: "none" }}
                                title="PDF Preview"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={onClose} className="cursor-default">
                            ปิด
                        </button>
                    </form>
                </dialog>
            )}
        </>
    );
};
