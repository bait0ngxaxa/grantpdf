import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActivitySection } from "@/app/(document)/components/forms/tor/ActivitySection";
import { DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH } from "@/lib/validation/schemas";
import type { ActivityData } from "@/config/initialData";

function ActivitySectionHarness(): React.JSX.Element {
    const [activities, setActivities] = React.useState<ActivityData[]>([
        {
            activity: "",
            manager: "",
            evaluation2: "",
            duration: "",
        },
    ]);

    const updateActivity = (
        index: number,
        field: keyof ActivityData,
        value: string,
    ): void => {
        setActivities((current) =>
            current.map((activity, activityIndex) =>
                activityIndex === index
                    ? { ...activity, [field]: value }
                    : activity,
            ),
        );
    };

    return (
        <ActivitySection
            activities={activities}
            addActivityRow={vi.fn()}
            removeActivityRow={vi.fn()}
            updateActivity={updateActivity}
        />
    );
}

describe("ActivitySection", () => {
    it("renders counters for each textarea and updates them while typing", () => {
        render(<ActivitySectionHarness />);

        const activityTextarea = screen.getByPlaceholderText("กิจกรรม");
        const managerTextarea = screen.getByPlaceholderText("ผู้ติดตามโครงการ");
        const evaluationTextarea =
            screen.getByPlaceholderText("วิธีการประเมินผล");
        const durationTextarea = screen.getByPlaceholderText("ระยะเวลา");

        expect(activityTextarea).toHaveAttribute(
            "maxlength",
            DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH.toString(),
        );
        expect(managerTextarea).toHaveAttribute(
            "maxlength",
            DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH.toString(),
        );
        expect(evaluationTextarea).toHaveAttribute(
            "maxlength",
            DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH.toString(),
        );
        expect(durationTextarea).toHaveAttribute(
            "maxlength",
            DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH.toString(),
        );

        const longValue = "ก".repeat(DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH);

        expect(() => {
            fireEvent.change(activityTextarea, {
                target: { value: longValue },
            });
        }).not.toThrow();

        expect(screen.getByText(
            `${DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH}/${DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH}`,
        )).toBeInTheDocument();
    });
});
