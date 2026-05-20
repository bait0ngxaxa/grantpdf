import { BarChart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { RichTextField } from "@/app/(document)/components/document-form/RichTextField";
import { FormSection } from "@/app/(document)/components/document-form/FormSection";
import { type ActivityData } from "@/config/initialData";
import { DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH } from "@/lib/validation/constants";

interface ActivitySectionProps {
    activities: ActivityData[];
    addActivityRow: () => void;
    removeActivityRow: (index: number) => void;
    updateActivity: (
        index: number,
        field: keyof ActivityData,
        value: string,
    ) => void;
}

export function ActivitySection({
    activities,
    addActivityRow,
    removeActivityRow,
    updateActivity,
}: ActivitySectionProps): React.JSX.Element {
    return (
        <FormSection
            title="การกำกับติดตามและประเมินผล"
            bgColor="bg-indigo-50 dark:bg-indigo-900/20"
            borderColor="border-indigo-200 dark:border-indigo-900/50"
            headerBorderColor="border-indigo-300 dark:border-indigo-800"
            icon={
                <BarChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            }
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="hidden lg:grid grid-cols-4 gap-2 p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-t-lg font-semibold text-sm text-indigo-900 dark:text-indigo-100">
                    <div>กิจกรรม</div>
                    <div>ผู้ติดตามโครงการ</div>
                    <div>วิธีการประเมินผล</div>
                    <div>ระยะเวลา</div>
                </div>

                {/* Dynamic Rows */}
                {activities.map((activity, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-1 lg:grid-cols-4 gap-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm relative"
                    >
                        <div>
                            <RichTextField
                                label="กิจกรรม"
                                name="activity"
                                placeholder="กิจกรรม"
                                value={activity.activity}
                                maxLength={DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH}
                                onValueChange={(_name, value) =>
                                    updateActivity(index, "activity", value)
                                }
                                className="h-32 lg:h-40"
                                toolbarVariant="compact"
                                labelClassName="lg:hidden"
                            />
                        </div>
                        <div>
                            <RichTextField
                                label="ผู้ติดตามโครงการ"
                                name="manager"
                                placeholder="ผู้ติดตามโครงการ"
                                value={activity.manager}
                                maxLength={DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH}
                                onValueChange={(_name, value) =>
                                    updateActivity(index, "manager", value)
                                }
                                className="h-32 lg:h-40"
                                toolbarVariant="compact"
                                labelClassName="lg:hidden"
                            />
                        </div>
                        <div>
                            <RichTextField
                                label="วิธีการประเมินผล"
                                name="evaluation2"
                                placeholder="วิธีการประเมินผล"
                                value={activity.evaluation2}
                                maxLength={DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH}
                                onValueChange={(_name, value) =>
                                    updateActivity(index, "evaluation2", value)
                                }
                                className="h-32 lg:h-40"
                                toolbarVariant="compact"
                                labelClassName="lg:hidden"
                            />
                        </div>
                        <div className="relative">
                            <RichTextField
                                label="ระยะเวลา"
                                name="duration"
                                placeholder="ระยะเวลา"
                                value={activity.duration}
                                maxLength={DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH}
                                onValueChange={(_name, value) =>
                                    updateActivity(index, "duration", value)
                                }
                                className="h-32 lg:h-40"
                                toolbarVariant="compact"
                                labelClassName="lg:hidden"
                            />
                            {activities.length > 1 && (
                                <Button
                                    type="button"
                                    onClick={() => removeActivityRow(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-1 right-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="lg:hidden ml-1">ลบ</span>
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add Row Button */}
                <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 p-4 dark:border-indigo-800 dark:bg-indigo-950/20">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                เพิ่มรายการกิจกรรม
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                เพิ่มแถวใหม่สำหรับกิจกรรม ผู้ติดตาม วิธีประเมิน และระยะเวลา
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={addActivityRow}
                            variant="outline"
                            className="h-10 shrink-0 cursor-pointer rounded-lg border-indigo-200 bg-white px-4 font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950"
                        >
                            <Plus className="size-4" />
                            เพิ่มแถวกิจกรรม
                        </Button>
                    </div>
                </div>
            </div>
        </FormSection>
    );
}
