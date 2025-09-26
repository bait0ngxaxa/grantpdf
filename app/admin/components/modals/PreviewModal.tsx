import React from 'react';

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
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl h-[90vh] bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                พรีวิว: {previewFileName}
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600 dark:hover:text-white"
                onClick={closePreviewModal}
              >
                ✕
              </button>
            </div>
            <div className="h-[calc(100%-80px)]">
              <iframe
                src={previewUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="PDF Preview"
              />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closePreviewModal}>ปิด</button>
          </form>
        </dialog>
      )}
    </>
  );
};