# 📊 Load Testing Guide — k6

คู่มือการทดสอบ Load Test สำหรับ Grant Online ด้วย k6

---

## สารบัญ

1. [k6 คืออะไร](#k6-คืออะไร)
2. [ติดตั้ง k6](#ติดตั้ง-k6)
3. [เตรียม Environment](#เตรียม-environment)
4. [ประเภท Test และวิธีรัน](#ประเภท-test-และวิธีรัน)
5. [อ่านผลลัพธ์](#อ่านผลลัพธ์)
6. [แนวทางแก้ไขเมื่อเจอปัญหา](#แนวทางแก้ไขเมื่อเจอปัญหา)
7. [ข้อควรระวัง](#ข้อควรระวัง)

---

## k6 คืออะไร

k6 เป็นเครื่องมือ Load Testing แบบ open-source จาก Grafana Labs เขียนสคริปต์ด้วย JavaScript รันจาก command line ใช้สำหรับทดสอบว่าแอปรับ traffic ได้มากแค่ไหนก่อนที่จะช้าหรือล่ม

**โครงสร้างไฟล์ test:**

```
tests/load/
├── config.js    ← ค่าตั้งค่ากลาง (URL, credentials, thresholds)
├── smoke.js     ← ทดสอบว่าระบบทำงานปกติ
├── load.js      ← ทดสอบโหลดระดับปกติ
├── stress.js    ← หาจุดแตกของระบบ
├── spike.js     ← ทดสอบ traffic พุ่งฉับพลัน
├── soak.js      ← ทดสอบความเสถียรระยะยาว
└── README.md    ← ไฟล์นี้
```

---

## ติดตั้ง k6

### บน VPS (Ubuntu / Debian)

```bash
# 1. เพิ่ม GPG key
sudo gpg -k
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68

# 2. เพิ่ม repository
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list

# 3. ติดตั้ง
sudo apt-get update
sudo apt-get install k6 -y

# 4. ตรวจว่าติดตั้งสำเร็จ
k6 version
```

### บน Windows (เครื่อง dev)

```powershell
# วิธี 1: Chocolatey
choco install k6

# วิธี 2: winget
winget install k6 --source winget

# วิธี 3: ดาวน์โหลดจาก https://dl.k6.io/msi/k6-latest-amd64.msi
```

### บน macOS

```bash
brew install k6
```

---

## เตรียม Environment

### ขั้นตอนที่ 1: ตั้งค่า config

เปิดไฟล์ `tests/load/config.js` แล้วแก้ค่า:

```javascript
// เปลี่ยนเป็น URL จริงของ VPS
export const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// เปลี่ยนเป็น test account จริง (สร้างไว้สำหรับ test โดยเฉพาะ)
export const TEST_USER = {
  email: __ENV.TEST_EMAIL || "loadtest@example.com",
  password: __ENV.TEST_PASSWORD || "LoadTest123!",
};
```

### ขั้นตอนที่ 2: สร้าง Test Account บนระบบจริง

เข้าไปที่หน้า signup ของแอป แล้วสร้าง account สำหรับ test:

- **Email:** `loadtest@example.com` (หรืออะไรก็ได้)
- **Password:** รหัสผ่านที่ตรงกับ config

> ⚠️ **สำคัญ:** ใช้บัญชีแยกสำหรับ test เท่านั้น อย่าใช้บัญชี admin จริง

### ขั้นตอนที่ 3: อัพโหลด test scripts ขึ้น VPS

```bash
# จากเครื่อง dev → VPS
scp -r tests/load/ user@your-vps-ip:/home/user/grant_online/tests/load/
```

หรือถ้า VPS ดึงจาก Git:

```bash
# บน VPS
cd /path/to/grant_online
git pull origin main
```

---

## ประเภท Test และวิธีรัน

### ลำดับที่แนะนำ

```
Smoke → Load → Stress → Spike → Soak
  ↓        ↓       ↓        ↓       ↓
ทำงานได้?  ปกติดี?  จุดแตก?   spike?  ระยะยาว?
```

---

### 1️⃣ Smoke Test — ระบบใช้งานได้ไหม?

**เมื่อไหร่:** หลัง deploy, หลังเปลี่ยน config, หลัง restart server

```bash
# รันบน VPS (ยิงไปที่ localhost)
k6 run tests/load/smoke.js

# รันจากเครื่อง dev (ยิงไปที่ VPS)
k6 run -e BASE_URL=https://your-domain.com tests/load/smoke.js
```

**สิ่งที่ทดสอบ:**
- Homepage โหลดได้ (status 200)
- หน้า Signin โหลดได้
- API ป้องกัน unauthorized access (status 401)

**ใช้เวลา:** ~1 นาที | **VUs:** 1 คน

**ผ่านถ้า:**
- ✅ Response time < 1 วินาที
- ✅ ไม่มี error

**ตัวอย่างผลลัพธ์ที่ดี:**

```
✓ homepage: status 200
✓ homepage: response < 1s
✓ signin: status 200
✓ protected API: returns 401 without auth

checks.........................: 100.00% ✓ 120  ✗ 0
http_req_duration..............: avg=45ms  p(95)=120ms
```

---

### 2️⃣ Load Test — รับโหลดปกติได้ไหม?

**เมื่อไหร่:** ก่อน launch, หลังทำ performance tuning

```bash
# รันบน VPS
k6 run tests/load/load.js

# รันจากเครื่อง dev ยิงไปที่ VPS
k6 run -e BASE_URL=https://your-domain.com \
       -e TEST_EMAIL=loadtest@example.com \
       -e TEST_PASSWORD=LoadTest123! \
       tests/load/load.js
```

**สิ่งที่ทดสอบ:**
- Login flow (NextAuth CSRF + credentials)
- Dashboard stats API
- Project listing API (paginated)
- Project creation (10% ของ users)

**ใช้เวลา:** ~16 นาที | **VUs:** 20 → 50 คน

**Ramp Pattern:**

```
Users
 50 ┤         ┌─────────────┐
    │         │             │
 20 ┤  ┌──────┘             └──┐
    │  │                       │
  0 ┤──┘                       └──
    └──┬──┬──────┬──┬──────┬───┬──→ เวลา
     0  2m       7m 9m     14m 16m
       ramp   sustain ramp sustain ramp
        up     20    up    50    down
```

**ผ่านถ้า:**
- ✅ Login: p95 < 800ms
- ✅ Project list: p95 < 500ms
- ✅ Project create: p95 < 1000ms
- ✅ Error rate < 1%

---

### 3️⃣ Stress Test — จุดแตกอยู่ตรงไหน?

**เมื่อไหร่:** ต้องการรู้ว่ารับได้สูงสุดกี่คน

```bash
k6 run tests/load/stress.js

# หรือยิงจากเครื่องอื่น
k6 run -e BASE_URL=https://your-domain.com tests/load/stress.js
```

**สิ่งที่ทดสอบ:**
- 60% GET pages (homepage, signin)
- 30% API reads (project stats)
- 10% API writes (create project)

**ใช้เวลา:** ~17 นาที | **VUs:** 10 → 50 → 100 → 200 → 300

**Ramp Pattern:**

```
Users
300 ┤                        ┌────┐
    │                        │    │
200 ┤                  ┌─────┘    │
    │                  │          │
100 ┤            ┌─────┘          │
    │            │                │
 50 ┤      ┌─────┘                │
 10 ┤  ┌───┘                      │
  0 ┤──┘                          └──→
    └──┬───┬─────┬─────┬─────┬────┬──→ เวลา
     0  2m  5m    8m   11m  14m  17m
```

**สิ่งที่ต้องดู:**
- ที่กี่ users response time เริ่มพุ่ง?
- ที่กี่ users เริ่มมี error 5xx?
- ที่กี่ users error rate ทะลุ 10%?
- ตอน ramp down ระบบ recover กลับมาได้ไหม?

**ผ่านถ้า:**
- ✅ p95 < 2 วินาที
- ✅ Error rate < 10%

---

### 4️⃣ Spike Test — traffic พุ่งฉับพลัน

**เมื่อไหร่:** จำลองสถานการณ์ "ประกาศผลทุน" → คนแห่เข้ามาพร้อมกัน

```bash
k6 run -e BASE_URL=https://your-domain.com tests/load/spike.js
```

**ใช้เวลา:** ~8 นาที | **VUs:** 5 → 200 (ภายใน 10 วินาที!)

**Ramp Pattern:**

```
Users
200 ┤    ╱──────────────╲
    │   ╱                ╲
    │  ╱                  ╲
  5 ┤──                    ──────────
    └──┬──┬──────────────┬──┬────────→
     0  1m    spike 3m    4m  6m
       ปกติ    💥 200!    กลับปกติ
```

**สิ่งที่ต้องดู:**
- ระบบ crash ไหม?
- หลัง spike ลดลง → performance กลับมาปกติไหม?
- มี connection pool exhausted ไหม?

---

### 5️⃣ Soak Test — เสถียรระยะยาว

**เมื่อไหร่:** หา memory leak, connection leak, performance degradation

```bash
k6 run -e BASE_URL=https://your-domain.com tests/load/soak.js
```

**ใช้เวลา:** ~34 นาที | **VUs:** 30 คน ค้างยาว 30 นาที

**สิ่งที่ต้องดู:**
- Response time ค่อยๆ เพิ่มขึ้นเรื่อยๆ ไหม? (= memory leak)
- Error rate เริ่มขึ้นหลัง 15-20 นาทีไหม? (= connection pool leak)
- ดู RAM usage บน VPS ด้วย `htop` ขณะรัน test

> 💡 **Tip:** เปิด terminal อีกหนึ่งอัน แล้วรัน `htop` หรือ `docker stats` พร้อมกันเพื่อดู resource usage

---

## อ่านผลลัพธ์

### ตัวอย่างผลลัพธ์ k6

```
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: tests/load/load.js
     output: -

  scenarios: (100.00%) 1 scenario, 50 max VUs, 18m30s max duration

     ✓ login: success (200 or 302)
     ✓ stats: status 200 or 401
     ✓ stats: response < 500ms
     ✗ projects: response < 500ms
      ↳  92% — ✓ 1840 / ✗ 160

     checks.........................: 97.50% ✓ 7800  ✗ 200
     data_received..................: 15 MB  58 kB/s
     data_sent......................: 3.2 MB 12 kB/s

   ✓ http_req_duration..............: avg=120ms  min=15ms  p(50)=85ms  p(90)=250ms  p(95)=380ms  p(99)=890ms
   ✓ http_req_failed................: 0.50%  ✓ 40   ✗ 7960

     http_reqs......................: 8000   30.77/s
     iteration_duration.............: avg=8.2s   min=6s    p(50)=8s    p(90)=10s   p(95)=11s
     iterations.....................: 1600   6.15/s
     vus............................: 50     min=0      max=50
     vus_max........................: 50     min=50     max=50

   ✓ login_duration.................: avg=200ms  p(95)=450ms
   ✓ project_list_duration..........: avg=85ms   p(95)=300ms
   ✓ project_create_duration........: avg=350ms  p(95)=800ms
```

### วิธีอ่าน — Metrics สำคัญ

| Metric | ความหมาย | ค่าที่ดี | ค่าอันตราย |
|---|---|---|---|
| `http_req_duration p(95)` | 95% ของ requests เร็วกว่านี้ | < 500ms | > 2000ms |
| `http_req_failed` | สัดส่วน request ที่ error | < 1% | > 5% |
| `checks` | สัดส่วนที่ผ่าน check | > 95% | < 80% |
| `http_reqs` | จำนวน requests/วินาที | ยิ่งสูงยิ่งดี | ลดลงเฉียบพลัน = bottleneck |
| `iterations` | จำนวน user flow ที่ทำเสร็จ | สม่ำเสมอ | ลดลง = ระบบรับไม่ไหว |

### เครื่องหมายผ่าน/ไม่ผ่าน

```
✓  = threshold ผ่าน (ค่า OK)
✗  = threshold ไม่ผ่าน (ต้องแก้ไข!)
```

### Export ผลลัพธ์เป็น JSON (เก็บไว้วิเคราะห์ทีหลัง)

```bash
# Export เป็น JSON
k6 run --out json=results/load-test-$(date +%Y%m%d).json tests/load/load.js

# Export เป็น CSV
k6 run --out csv=results/load-test-$(date +%Y%m%d).csv tests/load/load.js
```

---

## แนวทางแก้ไขเมื่อเจอปัญหา

### ปัญหา: Response time สูง (p95 > 1s)

```
สาเหตุที่เป็นไปได้         วิธีตรวจสอบ                     วิธีแก้
─────────────────────────────────────────────────────────────────────────
DB query ช้า              ดู slow query log              เพิ่ม index, optimize query
                           (MySQL slow-query-log=1)

Connection pool หมด       ดู error "pool timeout"         เพิ่ม connection_limit ใน
                           ใน app logs                    DATABASE_URL

CPU เต็ม                  รัน htop ขณะ test              เพิ่ม CPU หรือ optimize code

RAM เต็ม                  รัน free -h ขณะ test           เพิ่ม RAM หรือลด buffer pool
```

### ปัญหา: Error rate สูง (> 5%)

```
Error Code    สาเหตุ                              วิธีแก้
─────────────────────────────────────────────────────────────────
429           Rate limited                         ปรับ rate limit ให้สูงขึ้น
                                                   (lib/constants.ts)

500           App crash / unhandled error           ดู app logs (pm2 logs)

502           App ไม่ตอบ (ถ้ามี Nginx)              App process died → restart

503           Server overloaded                     ลด concurrent users หรือ
                                                   scale up resources
```

### ปัญหา: Soak Test — Performance ค่อยๆ แย่ลง

```
อาการ                      สาเหตุ                    วิธีแก้
─────────────────────────────────────────────────────────────────
RAM ค่อยๆ เพิ่ม             Memory leak               ตรวจ event listeners,
                                                     closures ที่ไม่ได้ cleanup

Response time ค่อยๆ ช้า     Connection pool leak      ตรวจว่า Prisma client
                                                     ใช้ singleton (lib/prisma.ts)

Error หลัง 20+ นาที        DB connections หมด          เพิ่ม max-connections
                                                     หรือลด connection_limit
```

---

## วิธีดู Resource Usage ขณะรัน Test

เปิด terminal แยกบน VPS แล้วรันคำสั่งเหล่านี้ **พร้อมกับ k6**:

### ดู CPU / RAM ทั้งเครื่อง

```bash
htop
```

### ดู Docker container resources

```bash
# real-time stats
docker stats

# ตัวอย่าง output:
# CONTAINER     CPU %   MEM USAGE / LIMIT     MEM %
# db-mysql      35%     1.2GiB / 3.5GiB       34%
# redis-cache   2%      45MiB / 512MiB        8%
```

### ดู MySQL connections ปัจจุบัน

```bash
# เข้า MySQL
docker exec -it db-mysql-staging mysql -uroot -p

# ดูจำนวน connections
SHOW STATUS LIKE 'Threads_connected';

# ดู max ที่เคยใช้
SHOW STATUS LIKE 'Max_used_connections';

# ดู slow queries
SHOW STATUS LIKE 'Slow_queries';
```

### ดู App logs

```bash
# ถ้าใช้ PM2
pm2 logs --lines 50

# ถ้าใช้ Docker
docker logs -f grant-online-app --tail 50
```

---

## ข้อควรระวัง

> ⚠️ **1. อย่ารัน stress/spike test กับ production ที่มีผู้ใช้จริง**
>
> ควรรันตอนไม่มีคนใช้ (เช่น กลางคืน) หรือสร้าง staging environment แยก

> ⚠️ **2. รัน k6 จากเครื่องอื่น ไม่ใช่ VPS ที่จะ test**
>
> ถ้ารัน k6 บน VPS เดียวกันกับ app, k6 จะแย่ง CPU/RAM กับ app ทำให้ผลไม่แม่นยำ
> แนะนำ: รัน k6 จากเครื่อง dev → ยิงไปที่ VPS

> ⚠️ **3. ลบ test data หลัง test**
>
> Load test จะสร้าง project จำนวนมาก ควรลบ test data หลังทดสอบเสร็จ:
> ```sql
> DELETE FROM Project WHERE name LIKE 'Load Test%' OR name LIKE 'Stress Test%';
> ```

> ⚠️ **4. เริ่มจาก Smoke Test เสมอ**
>
> อย่ากระโดดไปรัน Stress Test ทันที เริ่มจาก Smoke → Load → Stress ตามลำดับ

---

## Quick Reference

```bash
# ─── Smoke (ทำงานปกติไหม) ────────────────────────
k6 run -e BASE_URL=https://your-domain.com tests/load/smoke.js

# ─── Load (รับโหลดปกติได้ไหม) ─────────────────────
k6 run -e BASE_URL=https://your-domain.com \
       -e TEST_EMAIL=loadtest@example.com \
       -e TEST_PASSWORD=LoadTest123! \
       tests/load/load.js

# ─── Stress (หาจุดแตก) ────────────────────────────
k6 run -e BASE_URL=https://your-domain.com tests/load/stress.js

# ─── Spike (traffic พุ่งฉับพลัน) ──────────────────
k6 run -e BASE_URL=https://your-domain.com tests/load/spike.js

# ─── Soak (ทดสอบระยะยาว) ──────────────────────────
k6 run -e BASE_URL=https://your-domain.com tests/load/soak.js

# ─── Export ผลลัพธ์ ────────────────────────────────
k6 run --out json=results.json tests/load/load.js
```
