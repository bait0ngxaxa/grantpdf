export const IDEMPOTENCY_HEADERS = {
    PRIMARY: "Idempotency-Key",
    LEGACY: "X-Idempotency-Key",
} as const;

export const IDEMPOTENCY = {
    LEASE_DURATION_MS: 5 * 60 * 1000,
    LEASE_HEARTBEAT_INTERVAL_MS: 60 * 1000,
} as const;
