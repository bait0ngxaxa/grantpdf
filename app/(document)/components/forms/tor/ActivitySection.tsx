import { BarChart, Plus, Trash2 } from "lucide-react";
import { Button, Textarea } from "@/components/ui";
import { FormSection } from "@/app/(document)/components";
import { type ActivityData } from "@/config/initialData";
import { type ChangeEvent } from "react";

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
                        <div className="lg:contents">
                            <label className="lg:hidden block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                กิจกรรม
                            </label>
                            <Textarea
                                placeholder="กิจกรรม"
                                value={activity.activity}
                                onChange={(
                                    e: ChangeEvent<HTMLTextAreaElement>,
                                ) =>
                                    updateActivity(
                                        index,
                                        "activity",
                                        e.target.value,
                                    )
                                }
                                className="text-sm h-32 lg:h-40"
                            />
                        </div>
                        <div className="lg:contents">
                            <label className="lg:hidden block text-sm font-medium text-slate-700 dark:text-slate-300 mt-2 mb-1">
                                ผู้ติดตามโครงการ
                            </label>
                            <Textarea
                                placeholder="ผู้ติดตามโครงการ"
                                value={activity.manager}
                                onChange={(
                                    e: ChangeEvent<HTMLTextAreaElement>,
                                ) =>
                                    updateActivity(
                                        index,
                                        "manager",
                                        e.target.value,
                                    )
                                }
                                className="text-sm h-32 lg:h-40"
                            />
                        </div>
                        <div className="lg:contents">
                            <label className="lg:hidden block text-sm font-medium text-slate-700 dark:text-slate-300 mt-2 mb-1">
                                วิธีการประเมินผล
                            </label>
                            <Textarea
                                placeholder="วิธีการประเมินผล"
                                value={activity.evaluation2}
                                onChange={(
                                    e: ChangeEvent<HTMLTextAreaElement>,
                                ) =>
                                    updateActivity(
                                        index,
                                        "evaluation2",
                                        e.target.value,
                                    )
                                }
                                className="text-sm h-32 lg:h-40"
                            />
                        </div>
                        <div className="relative">
                            <label className="lg:hidden block text-sm font-medium text-slate-700 dark:text-slate-300 mt-2 mb-1">
                                ระยะเวลา
                            </label>
                            <Textarea
                                placeholder="ระยะเวลา"
                                value={activity.duration}
                                onChange={(
                                    e: ChangeEvent<HTMLTextAreaElement>,
                                ) =>
                                    updateActivity(
                                        index,
                                        "duration",
                                        e.target.value,
                                    )
                                }
                                className="text-sm h-32 lg:h-40 mb-8 lg:mb-0"
                            />
                            {activities.length > 1 && (
                                <Button
                                    type="button"
                                    onClick={() => removeActivityRow(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="absolute bottom-2 right-2 lg:top-1 lg:right-1 lg:bottom-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="lg:hidden ml-1">ลบ</span>
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add Row Button */}
                <Button
                    type="button"
                    onClick={addActivityRow}
                    variant="outline"
                    className="w-full border-dashed border-2 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-600 py-4 h-auto"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    เพิ่มแถวกิจกรรม
                </Button>
            </div>
        </FormSection>
    );
}
