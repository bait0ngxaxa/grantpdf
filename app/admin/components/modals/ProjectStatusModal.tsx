import React from 'react';
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  userId: string;
  userName: string;
  userEmail: string;
  files: any[];
  _count: {
    files: number;
  };
}

interface ProjectStatusModalProps {
  isStatusModalOpen: boolean;
  selectedProjectForStatus: Project | null;
  newStatus: string;
  setNewStatus: (status: string) => void;
  isUpdatingStatus: boolean;
  closeStatusModal: () => void;
  handleUpdateProjectStatus: () => void;
  getStatusColor: (status: string) => string;
}

export const ProjectStatusModal: React.FC<ProjectStatusModalProps> = ({
  isStatusModalOpen,
  selectedProjectForStatus,
  newStatus,
  setNewStatus,
  isUpdatingStatus,
  closeStatusModal,
  handleUpdateProjectStatus,
  getStatusColor,
}) => {
  return (
    <>
      {isStatusModalOpen && selectedProjectForStatus && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white dark:bg-gray-800 max-w-md">
            <h3 className="font-bold text-lg text-primary mb-4">
              จัดการสถานะโครงการ
            </h3>
            <div className="py-4">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                โครงการ:{" "}
                <strong className="text-gray-900 dark:text-white">
                  {selectedProjectForStatus.name}
                </strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                สถานะปัจจุบัน:{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${getStatusColor(
                    selectedProjectForStatus.status
                  )}`}
                >
                  {selectedProjectForStatus.status}
                </span>
              </p>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">สถานะใหม่:</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  <option value="อนุมัติ">อนุมัติ</option>
                  <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                  <option value="แก้ไข">แก้ไข</option>
                  <option value="ปิดโครงการ">ปิดโครงการ</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={closeStatusModal}
                className="cursor-pointer px-4 py-2"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleUpdateProjectStatus}
                disabled={
                  isUpdatingStatus ||
                  newStatus === selectedProjectForStatus.status
                }
                className={`cursor-pointer px-4 py-2 ${
                  newStatus === selectedProjectForStatus.status
                    ? "opacity-50"
                    : ""
                }`}
              >
                {isUpdatingStatus ? "กำลังอัปเดต..." : "อัปเดตสถานะ"}
              </Button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeStatusModal}>ปิด</button>
          </form>
        </dialog>
      )}
    </>
  );
};