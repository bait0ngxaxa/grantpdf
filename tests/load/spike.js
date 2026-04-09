// tests/load/spike.js
// Spike Test — ทดสอบ traffic พุ่งจาก 0 → สูงมาก แบบฉับพลัน
// จำลองสถานการณ์: ประกาศผลทุน → คนแห่เข้ามาพร้อมกัน
//
// วิธีรัน: k6 run tests/load/spike.js
// ⚠️ อย่ารันกับ production ที่มีผู้ใช้จริง!

import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, JSON_HEADERS } from "./config.js";

export const options = {
  stages: [
    // ใช้งานปกติ
    { duration: "1m", target: 5 },

    // 💥 SPIKE! — พุ่งจาก 5 → 200 ภายใน 10 วินาที
    { duration: "10s", target: 200 },

    // ค้างที่ 200 users 3 นาที
    { duration: "3m", target: 200 },

    // ลดลงเร็ว — ดูว่า system recover ได้ไหม
    { duration: "10s", target: 5 },

    // ค้างที่ปกติ — ดูว่า performance กลับมาดีไหม
    { duration: "2m", target: 5 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"], // ยอม 3 วินาทีเพราะ spike
    http_req_failed: ["rate<0.15"],    // ยอม error 15%
  },
};

export default function () {
  // ดูหน้า dashboard (จำลองคนเข้ามาดูผล)
  const pageRes = http.get(`${BASE_URL}/`);
  check(pageRes, {
    "homepage: not server error": (r) => r.status < 500,
  });

  sleep(0.5);

  // ดู project stats
  const statsRes = http.get(`${BASE_URL}/api/projects/stats`, {
    headers: JSON_HEADERS,
  });
  check(statsRes, {
    "stats: not server error": (r) => r.status < 500,
  });

  sleep(Math.random() * 2 + 1);
}
