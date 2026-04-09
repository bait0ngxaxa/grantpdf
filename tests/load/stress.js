// tests/load/stress.js
// Stress Test — หาจุดแตก (breaking point) ของระบบ
// เพิ่ม users ขึ้นเรื่อยๆ จนระบบเริ่ม error หรือช้าลง
//
// วิธีรัน: k6 run tests/load/stress.js
// ⚠️ อย่ารันกับ production ที่มีผู้ใช้จริง!

import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, JSON_HEADERS } from "./config.js";

export const options = {
  stages: [
    // Phase 1: Warm up
    { duration: "2m", target: 10 },

    // Phase 2: ระดับปกติ
    { duration: "3m", target: 50 },

    // Phase 3: เริ่มหนัก
    { duration: "3m", target: 100 },

    // Phase 4: หนักมาก
    { duration: "3m", target: 200 },

    // Phase 5: สุดขีด — หาจุดแตก
    { duration: "3m", target: 300 },

    // Phase 6: Ramp down — ดูว่า recover ได้ไหม
    { duration: "3m", target: 0 },
  ],
  thresholds: {
    // Stress test ผ่อนปรนกว่า load test
    http_req_duration: ["p(95)<2000"],  // ยอมรับช้าถึง 2 วินาที
    http_req_failed: ["rate<0.10"],     // ยอมรับ error ถึง 10%
  },
};

export default function () {
  // Mix ของ requests ที่จำลอง traffic จริง

  // 60% — ดูหน้าเว็บ (GET pages)
  if (Math.random() < 0.6) {
    const pages = ["/", "/signin"];
    const page = pages[Math.floor(Math.random() * pages.length)];
    const res = http.get(`${BASE_URL}${page}`);
    check(res, {
      "page: status < 500": (r) => r.status < 500,
    });
  }

  // 30% — API reads
  if (Math.random() < 0.3) {
    const res = http.get(`${BASE_URL}/api/projects/stats`, {
      headers: JSON_HEADERS,
    });
    check(res, {
      "api read: status < 500": (r) => r.status < 500,
      "api read: response < 2s": (r) => r.timings.duration < 2000,
    });
  }

  // 10% — API writes
  if (Math.random() < 0.1) {
    const res = http.post(
      `${BASE_URL}/api/projects`,
      JSON.stringify({
        name: `Stress Test ${Date.now()}`,
        description: "k6 stress test",
      }),
      { headers: JSON_HEADERS },
    );
    check(res, {
      "api write: status < 500": (r) => r.status < 500,
    });
  }

  // Think time สั้นเพื่อให้ stress สูง
  sleep(Math.random() * 1 + 0.5);
}
