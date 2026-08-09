const BANGKOK_UTC_OFFSET_MS = 7 * 60 * 60 * 1_000;
const DAY_MS = 24 * 60 * 60 * 1_000;

function toBangkokClock(referenceDate: Date): Date {
    return new Date(referenceDate.getTime() + BANGKOK_UTC_OFFSET_MS);
}

export interface BangkokDayRange {
    start: Date;
    endExclusive: Date;
}

/**
 * Returns the absolute instants that bound the Bangkok calendar day containing
 * referenceDate. Bangkok is UTC+7 and does not observe daylight saving time.
 */
export function getBangkokDayRange(
    referenceDate: Date = new Date(),
): BangkokDayRange {
    const bangkokClock = toBangkokClock(referenceDate);
    const startTime =
        Date.UTC(
            bangkokClock.getUTCFullYear(),
            bangkokClock.getUTCMonth(),
            bangkokClock.getUTCDate(),
        ) - BANGKOK_UTC_OFFSET_MS;

    return {
        start: new Date(startTime),
        endExclusive: new Date(startTime + DAY_MS),
    };
}

export function getBangkokCalendarYear(
    referenceDate: Date = new Date(),
): number {
    return toBangkokClock(referenceDate).getUTCFullYear();
}
