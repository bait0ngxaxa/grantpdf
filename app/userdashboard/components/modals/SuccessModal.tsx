import React from 'react';
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  successMessage: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  showSuccessModal,
  setShowSuccessModal,
  successMessage,
}) => {
  const isError = successMessage.includes("ข้อผิดพลาด");

  return (
    <>
      {showSuccessModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isError
                    ? "bg-red-100 dark:bg-red-900/20"
                    : "bg-green-100 dark:bg-green-900/20"
                }`}
              >
                {isError ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600"
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
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <h3
                className={`font-bold text-lg mb-2 ${
                  isError ? "text-red-600" : "text-green-600"
                }`}
              >
                {isError ? "เกิดข้อผิดพลาด!" : "สำเร็จ!"}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {successMessage}
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className={`w-full ${
                  isError
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                ตกลง
              </Button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowSuccessModal(false)}>ปิด</button>
          </form>
        </dialog>
      )}
    </>
  );
};