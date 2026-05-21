"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface AttachmentListProps {
    attachments: string[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, value: string) => void;
}

export function AttachmentList({
    attachments,
    onAdd,
    onRemove,
    onUpdate,
}: AttachmentListProps): React.JSX.Element {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                        สิ่งที่ส่งมาด้วย
                    </label>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        เพิ่มรายการเอกสารแนบที่ต้องแสดงในหนังสืออนุมัติ
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAdd}
                    className="h-9 shrink-0 cursor-pointer rounded-lg border-blue-200 bg-blue-50 px-3 font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                    <Plus className="size-4" />
                    เพิ่มรายการ
                </Button>
            </div>

            {/* รายการ attachments */}
            <div className="space-y-3">
                {attachments.map((attachment, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70 sm:flex-row sm:items-center"
                    >
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                            {index + 1}
                        </div>
                        <Input
                            type="text"
                            placeholder={`รายละเอียดสิ่งที่ส่งมาด้วย ${index + 1}`}
                            className="h-10 flex-1 rounded-lg border-slate-200 bg-white px-3 text-slate-900 transition-colors focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            value={attachment}
                            onChange={(e) => onUpdate(index, e.target.value)}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(index)}
                            className="h-10 cursor-pointer rounded-lg px-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                        >
                            <Trash2 className="size-4" />
                            ลบ
                        </Button>
                    </div>
                ))}
            </div>

            {/* ข้อความช่วยเหลือ */}
            {attachments.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                    ยังไม่มีรายการสิ่งที่ส่งมาด้วย
                </div>
            )}
        </div>
    );
}
