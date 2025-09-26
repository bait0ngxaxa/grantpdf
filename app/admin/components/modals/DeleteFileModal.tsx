import React from 'react';
import { Button } from "@/components/ui/button";

interface DeleteFileModalProps {
  isDeleteModalOpen: boolean;
  selectedFileIdForDeletion: string | null;
  selectedFileNameForDeletion: string | null;
  isDeleting: boolean;
  closeDeleteModal: () => void;
  handleDeleteFile: () => void;
}

export const DeleteFileModal: React.FC<DeleteFileModalProps> = ({
  isDeleteModalOpen,
  selectedFileIdForDeletion,
  selectedFileNameForDeletion,
  isDeleting,
  closeDeleteModal,
  handleDeleteFile,
}) => {
  return (
    <>
      {isDeleteModalOpen && selectedFileIdForDeletion && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
            <h3 className="font-bold text-lg text-red-600 mb-4">
              ยืนยันการลบเอกสาร
            </h3>
            <div className="py-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                คุณแน่ใจหรือไม่ว่าต้องการลบเอกสาร{" "}
                <strong className="text-gray-900 dark:text-white">
                  {selectedFileNameForDeletion}
                </strong>
                ?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                className="cursor-pointer px-4 py-2"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleDeleteFile}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? "กำลังลบ..." : "ลบ"}
              </Button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeDeleteModal}>ปิด</button>
          </form>
        </dialog>
      )}
    </>
  );
};