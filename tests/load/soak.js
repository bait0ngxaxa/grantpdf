// tests/load/soak.js
// Soak Test — ทดสอบความเสถียรระยะยาว (30 นาที - 1 ชม.)
// เพื่อหา memory leaks, connection leaks, หรือ performance degradation
//
// วิธีรัน: k6 run tests/load/soak.js
// (ใช้เวลาประมาณ 35 นาที)

import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, JSON_HEADERS } from "./config.js";

export const options = {
  stages: [
    { duration: "2m", target: 30 },   // Ramp up
    { duration: "30m", target: 30 },   // ค้าง 30 users นาน 30 นาที
    { duration: "2m", target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  // จำลอง user flow ปกติ

  // ดูหน้าเว็บ
  const pageRes = http.get(`${BASE_URL}/`);
  check(pageRes, {
    "page: status 200": (r) => r.status === 200,
  });

  sleep(2);

  // API call
  const apiRes = http.get(`${BASE_URL}/api/projects/stats`, {
    headers: JSON_HEADERS,
  });
  check(apiRes, {
    "api: not error": (r) => r.status < 500,
  });

  // Think time ยาว — จำลองการใช้งานจริง
  sleep(Math.random() * 5 + 5);
}
