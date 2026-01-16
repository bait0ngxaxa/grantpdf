"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                สิ่งที่ส่งมาด้วย
            </label>

            {/* รายการ attachments */}
            {attachments.map((attachment, index) => (
                <div key={index} className="flex gap-2 mb-3">
                    <Input
                        type="text"
                        placeholder={`รายละเอียดสิ่งที่ส่งมาด้วย ${index + 1}`}
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={attachment}
                        onChange={(e) => onUpdate(index, e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="px-3 py-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                        ลบ
                    </Button>
                </div>
            ))}

            {/* ปุ่มเพิ่ม attachment */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAdd}
                className="w-full py-2 border-dashed border-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
            >
                + เพิ่มสิ่งที่ส่งมาด้วย
            </Button>

            {/* ข้อความช่วยเหลือ */}
            {attachments.length === 0 && (
                <p className="text-sm text-slate-500 mt-2">
                    คลิกปุ่ม &quot;เพิ่มสิ่งที่ส่งมาด้วย&quot; เพื่อเพิ่มรายการ
                    (ถ้ามี)
                </p>
            )}
        </div>
    );
}
