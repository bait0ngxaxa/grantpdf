import React from "react";
import { Button } from "@/components/ui";
import type {
  AdminProject,
  ProgramSummary,
  ProjectCoOwnerSummary,
} from "@/type/models";
import {
  ChevronDown,
  ClipboardList,
  FolderKanban,
  Loader2,
  Search,
  UserCog,
  X,
} from "lucide-react";
import { cn } from "@/lib/shared/utils";
import { STATUS_ORDER } from "@/lib/shared/constants";
import { PROJECT_STATUS_NOTE_MAX_LENGTH } from "@/lib/validation/constants";
import { getProgramAccent } from "@/components/programAccent";

const CO_OWNER_VISIBLE_LIMIT = 50;

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
  coOwnerUserOptions: ProjectCoOwnerSummary[];
  isProgramsLoading: boolean;
  isCoOwnerUsersLoading: boolean;
  programsError: string | null;
  coOwnerUsersError: string | null;
  allowCoOwners: boolean;
  setAllowCoOwners: (allowCoOwners: boolean) => void;
  selectedCoOwnerUserIds: string[];
  setSelectedCoOwnerUserIds: (coOwnerUserIds: string[]) => void;
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
  coOwnerUserOptions,
  isProgramsLoading,
  isCoOwnerUsersLoading,
  programsError,
  coOwnerUsersError,
  allowCoOwners,
  setAllowCoOwners,
  selectedCoOwnerUserIds,
  setSelectedCoOwnerUserIds,
  isUpdatingStatus,
  closeStatusModal,
  handleUpdateProjectStatus,
  getStatusColor,
}) => {
  const [coOwnerSearch, setCoOwnerSearch] = React.useState("");
  const selectedProgram = React.useMemo(
    () => programs.find((program) => program.id === selectedProgramId) ?? null,
    [programs, selectedProgramId],
  );
  const programAccent = selectedProgram ? getProgramAccent(selectedProgram) : null;
  const selectedCoOwnerIdSet = React.useMemo(
    () => new Set(selectedCoOwnerUserIds),
    [selectedCoOwnerUserIds],
  );
  const primaryOwnerId = selectedProjectForStatus?.userId ?? "";
  const availableCoOwnerOptions = React.useMemo(
    () =>
      coOwnerUserOptions.filter(
        (user) => user.id !== primaryOwnerId,
      ),
    [coOwnerUserOptions, primaryOwnerId],
  );
  const selectedCoOwnerOptions = React.useMemo(() => {
    const coOwnerMap = new Map(
      availableCoOwnerOptions.map((user) => [user.id, user]),
    );

    return selectedCoOwnerUserIds
      .map((id) => coOwnerMap.get(id))
      .filter((user): user is ProjectCoOwnerSummary => user !== undefined);
  }, [availableCoOwnerOptions, selectedCoOwnerUserIds]);
  const filteredCoOwnerOptions = React.useMemo(() => {
    const query = coOwnerSearch.trim().toLowerCase();

    if (query.length === 0) {
      return availableCoOwnerOptions;
    }

    return availableCoOwnerOptions.filter((user) => {
      const name = user.name.toLowerCase();
      const email = user.email.toLowerCase();

      return name.includes(query) || email.includes(query);
    });
  }, [availableCoOwnerOptions, coOwnerSearch]);
  const visibleCoOwnerOptions = filteredCoOwnerOptions.slice(
    0,
    CO_OWNER_VISIBLE_LIMIT,
  );
  const hiddenCoOwnerCount =
    filteredCoOwnerOptions.length - visibleCoOwnerOptions.length;

  const toggleCoOwner = (coOwnerUserId: string): void => {
    setSelectedCoOwnerUserIds(
      selectedCoOwnerIdSet.has(coOwnerUserId)
        ? selectedCoOwnerUserIds.filter((id) => id !== coOwnerUserId)
        : [...selectedCoOwnerUserIds, coOwnerUserId],
    );
  };

  const handleAllowCoOwnersChange = (allow: boolean): void => {
    setAllowCoOwners(allow);

    if (!allow) {
      setCoOwnerSearch("");
    }
  };

  const requestClose = React.useCallback((): void => {
    if (isUpdatingStatus) return;
    closeStatusModal();
  }, [closeStatusModal, isUpdatingStatus]);

  const hasCoOwnerChanges =
    allowCoOwners !== selectedProjectForStatus?.allowCoOwners ||
    selectedCoOwnerUserIds.join(",") !==
      (selectedProjectForStatus?.coOwners || [])
        .map((coOwner) => coOwner.id)
        .join(",");

  const hasProjectChanges =
    newStatus !== selectedProjectForStatus?.status ||
    statusNote !== (selectedProjectForStatus?.statusNote || "") ||
    selectedProgramId !== (selectedProjectForStatus?.programId || "") ||
    hasCoOwnerChanges;
  const coOwnerSelectionError =
    allowCoOwners && selectedCoOwnerUserIds.length === 0
      ? "กรุณาเลือกเจ้าของร่วมอย่างน้อย 1 คน"
      : null;

  React.useEffect(() => {
    if (!isStatusModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        requestClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isStatusModalOpen, requestClose]);

  return (
    <>
      {isStatusModalOpen && selectedProjectForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <button
            type="button"
            aria-label="ปิดหน้าต่างจัดการสถานะ"
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm duration-200 motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none"
            onClick={requestClose}
            disabled={isUpdatingStatus}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-status-modal-title"
            className="relative z-10 max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_14px_rgba(15,23,42,0.12)] duration-200 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-2 motion-reduce:animate-none sm:max-h-[calc(100dvh-2rem)] sm:p-6 dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_8px_14px_rgba(0,0,0,0.32)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h3
                  id="project-status-modal-title"
                  className="text-xl font-bold text-balance text-slate-800 dark:text-slate-100"
                >
                  จัดการสถานะ
                </h3>
              </div>
              <button
                type="button"
                aria-label="ปิดหน้าต่างจัดการสถานะ"
                onClick={requestClose}
                disabled={isUpdatingStatus}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
              <div className="min-w-0 rounded-2xl bg-slate-50 p-4 lg:col-start-1 lg:row-start-1 dark:bg-slate-700/50">
                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                  โครงการ
                </p>
                <p className="mb-4 whitespace-normal break-words text-lg font-semibold leading-7 text-slate-800 [overflow-wrap:anywhere] dark:text-slate-100">
                  {selectedProjectForStatus.name}
                </p>
                <div className="flex min-w-0 items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-600">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    สถานะปัจจุบัน
                  </span>
                  <span
                    className={cn(
                      "rounded-lg border px-3 py-1 text-xs font-semibold",
                      getStatusColor(selectedProjectForStatus.status),
                    )}
                  >
                    {selectedProjectForStatus.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col lg:col-start-2 lg:row-start-1">
                <div
                  className={cn(
                    "rounded-2xl border p-3 transition-colors",
                    selectedProgram ? programAccent?.panel : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/70",
                  )}
                >
                  <label className="mb-2 flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm",
                          selectedProgram ? programAccent?.icon : "bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600",
                        )}
                      >
                        <FolderKanban className="h-4 w-4" />
                      </span>
                      โครงการหลัก
                    </span>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold dark:bg-slate-900/60",
                        selectedProgram ? programAccent?.text : "text-slate-500 dark:text-slate-400",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          selectedProgram ? programAccent?.dot : "bg-slate-400",
                        )}
                      />
                      {selectedProgram?.isActive === false
                        ? "ปิดใช้งาน"
                        : selectedProgram
                          ? "เลือกแล้ว"
                          : "ยังไม่กำหนด"}
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-white/80 bg-white py-2.5 pl-3 pr-10 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-700"
                      value={selectedProgramId}
                      onChange={(e) => setSelectedProgramId(e.target.value)}
                      disabled={isProgramsLoading}
                    >
                      <option value="">ยังไม่ได้กำหนดโครงการหลัก</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                          {!program.isActive ? " (ปิดใช้งาน)" : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                {programsError && (
                  <p className="mt-2 text-xs text-red-500">{programsError}</p>
                )}
              </div>

              <div className="flex flex-col lg:col-start-2 lg:row-start-2">
                <label className="flex items-center pb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    เลือกสถานะใหม่
                  </span>
                </label>
                <select
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUS_ORDER.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-start-1 lg:row-span-2 lg:row-start-2 dark:border-slate-600 dark:bg-slate-700/40">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <UserCog className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        เจ้าของร่วมโครงการ
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        เลือกผู้ใช้ที่สามารถเข้าไปจัดการโครงการนี้ร่วมกันได้
                      </p>
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={allowCoOwners}
                      onChange={(event) =>
                        handleAllowCoOwnersChange(event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    เปิดใช้
                  </label>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      เลือกแล้ว {selectedCoOwnerUserIds.length} คน
                    </span>
                    {selectedCoOwnerUserIds.length > 0 && (
                      <button
                        type="button"
                        disabled={!allowCoOwners}
                        onClick={() => setSelectedCoOwnerUserIds([])}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        ล้างทั้งหมด
                      </button>
                    )}
                  </div>

                  {selectedCoOwnerOptions.length > 0 && (
                    <div className="flex max-h-20 flex-wrap gap-2 overflow-y-auto">
                      {selectedCoOwnerOptions.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          disabled={!allowCoOwners}
                          onClick={() =>
                            setSelectedCoOwnerUserIds(
                              selectedCoOwnerUserIds.filter(
                                (id) => id !== user.id,
                              ),
                            )
                          }
                          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200"
                        >
                          <span className="truncate">{user.name}</span>
                          <X className="h-3 w-3 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={coOwnerSearch}
                      onChange={(event) => setCoOwnerSearch(event.target.value)}
                      placeholder="ค้นหาชื่อหรืออีเมล"
                      disabled={
                        !allowCoOwners ||
                        isCoOwnerUsersLoading ||
                        coOwnerUserOptions.length === 0
                      }
                      className="min-h-11 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:disabled:bg-slate-800"
                    />
                  </label>

                  <div className="max-h-44 space-y-1 overflow-y-auto lg:max-h-52">
                  {isCoOwnerUsersLoading ? (
                    <div className="flex items-center gap-2 px-2 py-3 text-xs text-slate-500 dark:text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                      กำลังโหลดรายชื่อผู้ใช้…
                    </div>
                  ) : availableCoOwnerOptions.length === 0 ? (
                    <p className="px-2 py-3 text-xs text-slate-500 dark:text-slate-400">
                      ไม่พบรายชื่อผู้ใช้
                    </p>
                  ) : filteredCoOwnerOptions.length === 0 ? (
                    <p className="px-2 py-3 text-xs text-slate-500 dark:text-slate-400">
                      ไม่พบผู้ใช้ที่ตรงกับคำค้นหา
                    </p>
                  ) : (
                    visibleCoOwnerOptions.map((user) => (
                        <label
                          key={user.id}
                          className={cn(
                            "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                            allowCoOwners
                              ? "hover:bg-white dark:hover:bg-slate-700"
                              : "cursor-not-allowed opacity-50",
                          )}
                        >
                          <input
                            type="checkbox"
                            disabled={!allowCoOwners}
                            checked={selectedCoOwnerIdSet.has(user.id)}
                            onChange={() => toggleCoOwner(user.id)}
                            className="h-4 w-4 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-slate-700 dark:text-slate-200">
                              {user.name}
                            </span>
                            <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                              {user.email}
                            </span>
                          </span>
                        </label>
                      ))
                  )}
                    {hiddenCoOwnerCount > 0 && (
                      <p className="px-2 py-2 text-xs text-slate-500 dark:text-slate-400">
                        แสดง {CO_OWNER_VISIBLE_LIMIT} คนแรกจาก{" "}
                        {filteredCoOwnerOptions.length} คน พิมพ์ค้นหาเพิ่มเพื่อจำกัดผลลัพธ์
                      </p>
                    )}
                  </div>
                </div>
                {coOwnerUsersError && (
                  <p className="mt-2 text-xs text-red-500">
                    {coOwnerUsersError}
                  </p>
                )}
                {coOwnerSelectionError && (
                  <p className="mt-2 text-xs text-red-500">
                    {coOwnerSelectionError}
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
                  className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-slate-700 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  placeholder="เพิ่มคำอธิบายหรือหมายเหตุสำหรับผู้ใช้…"
                  value={statusNote}
                  maxLength={PROJECT_STATUS_NOTE_MAX_LENGTH}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
                <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">
                  {statusNote.length}/{PROJECT_STATUS_NOTE_MAX_LENGTH}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={requestClose}
                disabled={isUpdatingStatus}
                className="h-11 cursor-pointer rounded-xl border-slate-200 px-6 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleUpdateProjectStatus}
                disabled={
                  isUpdatingStatus ||
                  !!programsError ||
                  !!coOwnerUsersError ||
                  !!coOwnerSelectionError ||
                  !hasProjectChanges
                }
                className={cn(
                  "h-11 transform cursor-pointer rounded-xl bg-blue-600 px-6 text-white shadow-lg shadow-blue-200 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] hover:bg-blue-700 active:scale-95",
                  !hasProjectChanges ? "cursor-not-allowed opacity-50" : "",
                )}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
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
