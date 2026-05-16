import React from "react";
import { Button } from "@/components/ui";
import type {
    AdminProject,
    ProgramSummary,
    ProjectCoOwnerSummary,
} from "@/type/models";
import { ClipboardList, Loader2, UserCog, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_ORDER } from "@/lib/constants";
import { PROJECT_STATUS_NOTE_MAX_LENGTH } from "@/lib/validation/constants";

interface ProjectStatusModalProps {
    isStatusModalOpen: boolean;
    selectedProjectForStatus: AdminProject | null;
    newStatus: string;
    setNewStatus: (status: string) => void;
    statusNote: string;
    setStatusNote: (note: string) => void;
    selectedProgramId: string;
    setSelectedProgramId: (programId: string) => void;
    programs: ProgramSummary[];
    adminOwnerOptions: ProjectCoOwnerSummary[];
    isProgramsLoading: boolean;
    isAdminOwnersLoading: boolean;
    programsError: string | null;
    adminOwnersError: string | null;
    allowCoOwners: boolean;
    setAllowCoOwners: (allowCoOwners: boolean) => void;
    selectedCoOwnerAdminIds: string[];
    setSelectedCoOwnerAdminIds: (adminUserIds: string[]) => void;
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
    statusNote,
    setStatusNote,
    selectedProgramId,
    setSelectedProgramId,
    programs,
    adminOwnerOptions,
    isProgramsLoading,
    isAdminOwnersLoading,
    programsError,
    adminOwnersError,
    allowCoOwners,
    setAllowCoOwners,
    selectedCoOwnerAdminIds,
    setSelectedCoOwnerAdminIds,
    isUpdatingStatus,
    closeStatusModal,
    handleUpdateProjectStatus,
    getStatusColor,
}) => {
    const toggleCoOwner = (adminUserId: string): void => {
        setSelectedCoOwnerAdminIds(
            selectedCoOwnerAdminIds.includes(adminUserId)
                ? selectedCoOwnerAdminIds.filter((id) => id !== adminUserId)
                : [...selectedCoOwnerAdminIds, adminUserId],
        );
    };

    const hasCoOwnerChanges =
        allowCoOwners !== selectedProjectForStatus?.allowCoOwners ||
        selectedCoOwnerAdminIds.join(",") !==
            (selectedProjectForStatus?.coOwners || [])
                .map((coOwner) => coOwner.id)
                .join(",");

    const hasProjectChanges =
        newStatus !== selectedProjectForStatus?.status ||
        statusNote !== (selectedProjectForStatus?.statusNote || "") ||
        selectedProgramId !== (selectedProjectForStatus?.programId || "") ||
        hasCoOwnerChanges;

    return (
        <>
            {isStatusModalOpen && selectedProjectForStatus && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="ปิดหน้าต่างจัดการสถานะ"
                        className="absolute inset-0 backdrop-blur-sm bg-slate-900/20"
                        onClick={closeStatusModal}
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="project-status-modal-title"
                        className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <ClipboardList className="h-6 w-6" />
                                </div>
                                <h3
                                    id="project-status-modal-title"
                                    className="font-bold text-xl text-slate-800 dark:text-slate-100 text-balance"
                                >
                                    จัดการสถานะ
                                </h3>
                            </div>
                            <button
                                type="button"
                                aria-label="ปิดหน้าต่างจัดการสถานะ"
                                onClick={closeStatusModal}
                                className="p-1.5 rounded-full inline-flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
                            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50 lg:col-start-1 lg:row-start-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                    โครงการ
                                </p>
                                <p className="font-semibold text-slate-800 dark:text-slate-100 text-lg mb-4 truncate">
                                    {selectedProjectForStatus.name}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-600">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        สถานะปัจจุบัน
                                    </span>
                                    <span
                                        className={cn(
                                            "px-3 py-1 rounded-lg text-xs font-semibold border",
                                            getStatusColor(selectedProjectForStatus.status),
                                        )}
                                    >
                                        {selectedProjectForStatus.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col lg:col-start-2 lg:row-start-1">
                                <label className="flex items-center pb-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        โครงการหลัก
                                    </span>
                                </label>
                                <select
                                    className="w-full px-3 py-2 border bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none rounded-xl text-slate-700 dark:text-slate-200"
                                    value={selectedProgramId}
                                    onChange={(e) =>
                                        setSelectedProgramId(e.target.value)
                                    }
                                    disabled={isProgramsLoading}
                                >
                                    <option value="">
                                        ยังไม่ได้กำหนดโครงการหลัก
                                    </option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={program.id}>
                                            {program.name}
                                            {!program.isActive ? " (ปิดใช้งาน)" : ""}
                                        </option>
                                    ))}
                                </select>
                                {programsError && (
                                    <p className="mt-2 text-xs text-red-500">
                                        {programsError}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col lg:col-start-2 lg:row-start-2">
                                <label className="flex items-center pb-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        เลือกสถานะใหม่
                                    </span>
                                </label>
                                <select
                                    className="w-full px-3 py-2 border bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none rounded-xl text-slate-700 dark:text-slate-200"
                                    value={newStatus}
                                    onChange={(e) =>
                                        setNewStatus(e.target.value)
                                    }
                                >
                                    {STATUS_ORDER.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-700/40 lg:col-start-1 lg:row-span-2 lg:row-start-2">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-2">
                                        <UserCog className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                เจ้าของร่วมโครงการ
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                                เลือกแอดมินที่สามารถเข้าไปจัดการโครงการนี้ร่วมกันได้
                                            </p>
                                        </div>
                                    </div>
                                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={allowCoOwners}
                                            onChange={(event) =>
                                                setAllowCoOwners(
                                                    event.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        เปิดใช้
                                    </label>
                                </div>

                                <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-800/60 lg:max-h-60">
                                    {isAdminOwnersLoading ? (
                                        <div className="flex items-center gap-2 px-2 py-3 text-xs text-slate-500 dark:text-slate-400">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            กำลังโหลดรายชื่อแอดมิน…
                                        </div>
                                    ) : adminOwnerOptions.length === 0 ? (
                                        <p className="px-2 py-3 text-xs text-slate-500 dark:text-slate-400">
                                            ไม่พบรายชื่อแอดมิน
                                        </p>
                                    ) : (
                                        adminOwnerOptions
                                            .filter(
                                                (admin) =>
                                                    admin.id !==
                                                    selectedProjectForStatus.userId,
                                            )
                                            .map((admin) => (
                                            <label
                                                key={admin.id}
                                                className={cn(
                                                    "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                                                    allowCoOwners
                                                        ? "hover:bg-white dark:hover:bg-slate-700"
                                                        : "cursor-not-allowed opacity-50",
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    disabled={!allowCoOwners}
                                                    checked={selectedCoOwnerAdminIds.includes(
                                                        admin.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleCoOwner(admin.id)
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block truncate font-medium text-slate-700 dark:text-slate-200">
                                                        {admin.name}
                                                    </span>
                                                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                                                        {admin.email}
                                                    </span>
                                                </span>
                                            </label>
                                            ))
                                    )}
                                </div>
                                {adminOwnersError && (
                                    <p className="mt-2 text-xs text-red-500">
                                        {adminOwnersError}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col lg:col-start-2 lg:row-start-3">
                                <label className="flex items-center pb-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        หมายเหตุสถานะโครงการ (ไม่บังคับ)
                                    </span>
                                </label>
                                <textarea
                                    className="w-full p-3 border bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none rounded-xl text-slate-700 dark:text-slate-200 h-24 resize-none"
                                    placeholder="เพิ่มคำอธิบายหรือหมายเหตุสำหรับผู้ใช้…"
                                    value={statusNote}
                                    maxLength={PROJECT_STATUS_NOTE_MAX_LENGTH}
                                    onChange={(e) =>
                                        setStatusNote(e.target.value)
                                    }
                                />
                                <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">
                                    {statusNote.length}/
                                    {PROJECT_STATUS_NOTE_MAX_LENGTH}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={closeStatusModal}
                                className="cursor-pointer px-6 py-2 rounded-xl text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={handleUpdateProjectStatus}
                                disabled={
                                    isUpdatingStatus ||
                                    !!programsError ||
                                    !!adminOwnersError ||
                                    !hasProjectChanges
                                }
                                className={cn(
                                    "cursor-pointer px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] transform active:scale-95",
                                    !hasProjectChanges
                                        ? "opacity-50 cursor-not-allowed"
                                        : "",
                                )}
                            >
                                {isUpdatingStatus ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังอัปเดต…
                                    </>
                                ) : (
                                    "บันทึกการเปลี่ยนแปลง"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

