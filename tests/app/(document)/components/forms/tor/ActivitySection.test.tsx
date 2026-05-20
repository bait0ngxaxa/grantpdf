import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
    it("renders rich text editors and counters for each activity field", () => {
        render(<ActivitySectionHarness />);

        expect(screen.getByLabelText("กิจกรรม")).toBeInTheDocument();
        expect(screen.getByLabelText("ผู้ติดตามโครงการ")).toBeInTheDocument();
        expect(screen.getByLabelText("วิธีการประเมินผล")).toBeInTheDocument();
        expect(screen.getByLabelText("ระยะเวลา")).toBeInTheDocument();

        expect(
            screen.getAllByText(`0/${DOCUMENT_TEXTAREA_COMPACT_MAX_LENGTH}`),
        ).toHaveLength(4);
    });
});
