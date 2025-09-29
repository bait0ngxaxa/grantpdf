import React from 'react';

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
    <>
      {isModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl h-[90vh] bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                พรีวิว: {previewTitle}
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-600 dark:hover:text-white"
                onClick={() => setIsModalOpen(false)}
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
                title="Document Preview"
              />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsModalOpen(false)}>ปิด</button>
          </form>
        </dialog>
      )}
    </>
  );
};