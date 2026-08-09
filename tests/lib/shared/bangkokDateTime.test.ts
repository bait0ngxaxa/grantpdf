import { describe, expect, it } from "vitest";
import {
    getBangkokCalendarYear,
    getBangkokDayRange,
} from "@/lib/shared/dateTime/bangkok";

describe("getBangkokDayRange", () => {
    it("keeps the instant immediately before Bangkok midnight in the ending day", () => {
        const range = getBangkokDayRange(new Date("2026-08-08T16:59:59.999Z"));

        expect(range.start.toISOString()).toBe("2026-08-07T17:00:00.000Z");
        expect(range.endExclusive.toISOString()).toBe(
            "2026-08-08T17:00:00.000Z",
        );
    });

    it.each([
        {
            reference: "2026-08-08T17:00:00.000Z",
            start: "2026-08-08T17:00:00.000Z",
            endExclusive: "2026-08-09T17:00:00.000Z",
            label: "exactly Bangkok midnight",
        },
        {
            reference: "2026-08-09T16:59:59.999Z",
            start: "2026-08-08T17:00:00.000Z",
            endExclusive: "2026-08-09T17:00:00.000Z",
            label: "immediately before the next Bangkok midnight",
        },
        {
            reference: "2026-08-09T17:00:00.000Z",
            start: "2026-08-09T17:00:00.000Z",
            endExclusive: "2026-08-10T17:00:00.000Z",
            label: "exactly the next Bangkok midnight",
        },
    ])(
        "uses the UTC+7 boundary $label",
        ({ reference, start, endExclusive }) => {
            const range = getBangkokDayRange(new Date(reference));

            expect(range.start.toISOString()).toBe(start);
            expect(range.endExclusive.toISOString()).toBe(endExclusive);
            expect(range.start.getTime()).toBeLessThanOrEqual(
                new Date(reference).getTime(),
            );
            expect(new Date(reference).getTime()).toBeLessThan(
                range.endExclusive.getTime(),
            );
        },
    );
});

describe("getBangkokCalendarYear", () => {
    it("changes year at Bangkok midnight rather than UTC midnight", () => {
        expect(
            getBangkokCalendarYear(new Date("2026-12-31T16:59:59.999Z")),
        ).toBe(2026);
        expect(
            getBangkokCalendarYear(new Date("2026-12-31T17:00:00.000Z")),
        ).toBe(2027);
    });
});
