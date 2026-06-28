export const SESSION = {
    ACCESS_TOKEN_MAX_AGE_SECONDS: 15 * 60,
    REFRESH_TOKEN_MAX_AGE_SECONDS: 30 * 24 * 60 * 60,
    ACCESS_COOKIE_NAME: "__Host-grant_access_token",
    REFRESH_COOKIE_NAME: "__Secure-grant_refresh_token",
    SESSION_HINT_COOKIE_NAME: "__Host-grant_session_hint",
} as const;
