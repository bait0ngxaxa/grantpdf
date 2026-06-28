export const RATE_LIMIT = {
    AUTH: {
        SIGNUP: {
            ROUTE_KEY: "auth:signup",
            LIMIT: 5,
            WINDOW_MS: 60_000,
        },
        SIGNIN: {
            ROUTE_KEY: "auth:signin",
            LIMIT: 10,
            WINDOW_MS: 60_000,
        },
        FORGOT_PASSWORD: {
            ROUTE_KEY: "auth:forgot-password",
            LIMIT: 3,
            WINDOW_MS: 15 * 60_000,
        },
        RESET_PASSWORD: {
            ROUTE_KEY: "auth:reset-password",
            LIMIT: 5,
            WINDOW_MS: 15 * 60_000,
        },
        REFRESH: {
            ROUTE_KEY: "auth:refresh",
            LIMIT: 30,
            WINDOW_MS: 60_000,
        },
        LOGOUT: {
            ROUTE_KEY: "auth:logout",
            LIMIT: 30,
            WINDOW_MS: 60_000,
        },
        SESSIONS: {
            ROUTE_KEY: "auth:sessions",
            LIMIT: 60,
            WINDOW_MS: 60_000,
        },
    },
    USER: {
        PROJECT_MUTATION: {
            ROUTE_KEY: "user:project-mutation",
            LIMIT: 20,
            WINDOW_MS: 60_000,
        },
        DOCUMENT_GENERATE: {
            ROUTE_KEY: "user:document-generate",
            LIMIT: 12,
            WINDOW_MS: 60_000,
        },
        NOTIFICATION_MUTATION: {
            ROUTE_KEY: "user:notification-mutation",
            LIMIT: 120,
            WINDOW_MS: 60_000,
        },
    },
    ADMIN: {
        MUTATION: {
            ROUTE_KEY: "admin:mutation",
            LIMIT: 120,
            WINDOW_MS: 60_000,
        },
    },
} as const;
