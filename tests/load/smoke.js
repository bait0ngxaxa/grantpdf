// tests/load/smoke.js
// Smoke Test — ตรวจว่าระบบทำงานได้ปกติกับโหลดต่ำมาก (1-2 users)
// ใช้รันก่อน deploy หรือหลังแก้ config เพื่อเช็คว่าไม่พัง
//
// วิธีรัน: k6 run tests/load/smoke.js

import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, THRESHOLDS, JSON_HEADERS } from "./config.js";

export const options = {
  // แค่ 1 user, 1 นาที
  vus: 1,
  duration: "1m",
  thresholds: THRESHOLDS,
};

export default function () {
  // 1. Homepage
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    "homepage: status 200": (r) => r.status === 200,
    "homepage: response < 1s": (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // 2. Sign-in page
  const signinRes = http.get(`${BASE_URL}/signin`);
  check(signinRes, {
    "signin: status 200": (r) => r.status === 200,
  });

  sleep(1);

  // 3. API — try to access protected route (should return 401)
  const protectedRes = http.get(`${BASE_URL}/api/projects`, {
    headers: JSON_HEADERS,
  });
  check(protectedRes, {
    "protected API: returns 401 without auth": (r) => r.status === 401,
  });

  sleep(1);
}
