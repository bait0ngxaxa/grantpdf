import React from "react";

interface PreviewModalProps {
    isPreviewModalOpen: boolean;
    previewUrl: string;
    previewFileName: string;
    closePreviewModal: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
    isPreviewModalOpen,
    previewUrl,
    previewFileName,
    closePreviewModal,
}) => {
    return (
        <>
            {isPreviewModalOpen && (
                <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/40">
                    <div className="modal-box w-11/12 max-w-6xl h-[90vh] bg-white p-0 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center p-4 px-6 border-b border-slate-100 bg-white z-10">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500 flex-shrink-0">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 truncate">
                                    {previewFileName}
                                </h3>
                            </div>
                            <button
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                onClick={closePreviewModal}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
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
                        <button
                            onClick={closePreviewModal}
                            className="cursor-default"
                        >
                            ปิด
                        </button>
                    </form>
                </dialog>
            )}
        </>
    );
};
