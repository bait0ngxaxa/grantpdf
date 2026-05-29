// tests/load/load.js
// Load Test — ทดสอบโหลดระดับปกติ (ramp up → sustain → ramp down)
// จำลองการใช้งานจริง: login → ดู dashboard → ดู projects → สร้าง project
//
// วิธีรัน: k6 run tests/load/load.js
// กำหนด URL: k6 run -e BASE_URL=https://your-vps.com tests/load/load.js

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Trend } from "k6/metrics";
import { BASE_URL, TEST_USER, THRESHOLDS, JSON_HEADERS } from "./config.js";

// Custom metrics — ติดตามแยกต่อ endpoint
const loginDuration = new Trend("login_duration", true);
const projectListDuration = new Trend("project_list_duration", true);
const projectCreateDuration = new Trend("project_create_duration", true);
const failedLogins = new Counter("failed_logins");

export const options = {
  stages: [
    { duration: "2m", target: 20 },  // Ramp up → 20 users ใน 2 นาที
    { duration: "5m", target: 20 },  // ค้าง 20 users นาน 5 นาที
    { duration: "2m", target: 50 },  // Ramp up → 50 users
    { duration: "5m", target: 50 },  // ค้าง 50 users นาน 5 นาที
    { duration: "2m", target: 0 },   // Ramp down
  ],
  thresholds: {
    ...THRESHOLDS,
    login_duration: ["p(95)<800"],
    project_list_duration: ["p(95)<500"],
    project_create_duration: ["p(95)<1000"],
  },
};

// Login ด้วย grant credentials endpoint
function login() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/session/signin`,
    JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
    {
      headers: JSON_HEADERS,
    },
  );

  loginDuration.add(loginRes.timings.duration);

  const loginOk = loginRes.status === 200;
  if (!loginOk) {
    failedLogins.add(1);
  }

  check(loginRes, {
    "login: success (200)": () => loginOk,
  });

  return loginRes;
}

export default function () {
  // ---- ขั้น 1: Login ----
  group("01_Login", () => {
    login();
  });

  sleep(1);

  // ---- ขั้น 2: ดู Dashboard Stats ----
  group("02_Dashboard_Stats", () => {
    const res = http.get(`${BASE_URL}/api/projects/stats`, {
      headers: JSON_HEADERS,
    });
    check(res, {
      "stats: status 200 or 401": (r) => r.status === 200 || r.status === 401,
      "stats: response < 500ms": (r) => r.timings.duration < 500,
    });
  });

  sleep(2);

  // ---- ขั้น 3: ดู Project List ----
  group("03_Project_List", () => {
    const res = http.get(`${BASE_URL}/api/projects?page=1&limit=10`, {
      headers: JSON_HEADERS,
    });

    projectListDuration.add(res.timings.duration);

    check(res, {
      "projects: status 200 or 401": (r) =>
        r.status === 200 || r.status === 401,
      "projects: response < 500ms": (r) => r.timings.duration < 500,
    });
  });

  sleep(2);

  // ---- ขั้น 4: สร้าง Project (10% ของ users) ----
  group("04_Create_Project", () => {
    // จำลองว่า 10% ของ users จะสร้าง project
    if (Math.random() < 0.1) {
      const res = http.post(
        `${BASE_URL}/api/projects`,
        JSON.stringify({
          name: `Load Test Project ${Date.now()}`,
          description: "Created by k6 load test",
        }),
        { headers: JSON_HEADERS },
      );

      projectCreateDuration.add(res.timings.duration);

      check(res, {
        "create project: status 200 or 401 or 429": (r) =>
          [200, 401, 429].includes(r.status),
      });
    }
  });

  // จำลอง think time ระหว่าง action (3-5 วินาที)
  sleep(Math.random() * 2 + 3);
}
