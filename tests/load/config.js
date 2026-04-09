// tests/load/config.js
// Shared configuration for all k6 load test scripts

// Base URL — change to your VPS URL before running
export const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Test user credentials — create a test account before running
export const TEST_USER = {
  email: __ENV.TEST_EMAIL || "loadtest@example.com",
  password: __ENV.TEST_PASSWORD || "LoadTest123!",
};

// Thresholds — the performance criteria to pass/fail
export const THRESHOLDS = {
  // 95th percentile response time must be < 500ms
  http_req_duration: ["p(95)<500", "p(99)<1500"],
  // Error rate must be < 1%
  http_req_failed: ["rate<0.01"],
  // At least 95% of checks must pass
  checks: ["rate>0.95"],
};

// Common headers
export const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
