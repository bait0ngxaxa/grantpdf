# Cloudflare Free Plan — Security Configuration Manual

คู่มือตั้งค่า Cloudflare Free Plan สำหรับเว็บ Next.js ที่ deploy ผ่าน Cloudflare proxy

---

## สารบัญ

1. [สิ่งที่ Free Plan ใช้ได้](#1-สิ่งที่-free-plan-ใช้ได้)
2. [Rate Limiting Rule (1 rule)](#2-rate-limiting-rule-1-rule)
3. [Custom WAF Rules (5 rules)](#3-custom-waf-rules-5-rules)
4. [Free Features ที่ควรเปิด](#4-free-features-ที่ควรเปิด)
5. [สิ่งที่ห้ามทำ](#5-สิ่งที่ห้ามทำ)
6. [Defense-in-Depth Overview](#6-defense-in-depth-overview)

---

## 1. สิ่งที่ Free Plan ใช้ได้

| Feature                  | จำนวน    | ใช้งานได้ |
| ------------------------ | -------- | --------- |
| WAF Rate Limiting Rules  | 1 rule   | ✅        |
| Custom WAF Rules         | 5 rules  | ✅        |
| Bot Fight Mode           | ✅       | ✅        |
| Security Level           | ✅       | ✅        |
| Browser Integrity Check  | ✅       | ✅        |
| Under Attack Mode        | ✅       | ✅        |
| IP Access Rules          | Unlimited| ✅        |
| Turnstile (CAPTCHA)      | Unlimited| ✅        |

### Free Plan ข้อจำกัดสำคัญ

- Rate Limiting: **Period** และ **Duration** เลือกได้แค่ **10 วินาที**
- Rate Limiting: **Action** มีแค่ **Block**
- Custom WAF Rules: **Action** มี Block, Managed Challenge, JS Challenge, etc.

---

## 2. Rate Limiting Rule (1 rule)

**Path:** `Security → WAF → Rate limiting rules → Create rule`

ใช้ rule เดียวคุ้มที่สุดคือป้องกัน auth endpoints จาก burst attack

| Parameter                  | Value                              |
| -------------------------- | ---------------------------------- |
| **Rule name**              | Auth Endpoints Protection          |
| **Expression**             | ดู expression ด้านล่าง              |
| **With the same**          | IP                                 |
| **Requests**               | 5                                  |
| **Period**                  | 10 seconds                         |
| **Then take action**       | Block                              |
| **For duration**           | 10 seconds                         |
| **Place at**               | First                              |

### Expression

```
(starts_with(http.request.uri.path, "/api/auth/") and http.request.method eq "POST")
```

### ทำไมตั้งค่าแบบนี้

- **5 req / 10 วินาที**: คนจริงไม่มีทาง submit form 5 ครั้งใน 10 วิ — bot ยิงได้สบาย
- **Block**: Free Plan มีแค่ Block เป็น action
- **Duration 10 วิ**: Free Plan เลือกได้แค่ 10 วิ — bot จะถูก slow down อย่างมาก
- **POST เท่านั้น**: GET ไปหน้า signin/signup ไม่มีอันตราย

### เมื่อ user ชน limit

Cloudflare จะ return **Error 1015** (You are being rate limited) เป็นเวลา 10 วินาที
หลัง 10 วิ user สามารถ request ได้อีก — ถ้ายิงเกินอีกจะโดน block ซ้ำวนลูป

---

## 3. Custom WAF Rules (5 rules)

**Path:** `Security → WAF → Custom rules → Create rule`

### Rule 1: Scanner Path Block ✅ ใช้ได้กับทุกเว็บ

Block bot ที่ scan หา WordPress, PHP, sensitive files

```
(lower(http.request.uri.path) in {"/wp-login.php" "/wp-admin" "/xmlrpc.php" "/.env" "/.git" "/.git/config" "/phpmyadmin" "/admin.php" "/wp-content" "/wp-includes" "/cgi-bin" "/eval-stdin.php" "/.aws/credentials" "/.DS_Store" "/composer.json" "/package.json"})
```

| Parameter  | Value              |
| ---------- | ------------------ |
| **Action** | Block              |

> เว็บ Next.js ไม่มี path พวกนี้ → request ที่เข้ามา 100% เป็น bot/scanner

---

### Rule 2: Non-Browser Auth POST ✅ ใช้ได้กับทุกเว็บที่มีระบบ login

Block POST ไปยัง auth API ที่ไม่มี browser User-Agent

```
(starts_with(http.request.uri.path, "/api/auth/") and http.request.method eq "POST" and not http.user_agent contains "Mozilla")
```

| Parameter  | Value              |
| ---------- | ------------------ |
| **Action** | Block              |

> Browser จริงทุกตัว (Chrome, Firefox, Safari, Edge) มี "Mozilla" ใน UA เสมอ
> curl, python-requests, script ต่างๆ ไม่มี → โดน block

---

### Rule 3: Bot Tool Block ⚠️ ใช้ได้กับเว็บที่ไม่มี public API

Block เครื่องมือ hacker/scanner ที่ POST มาทุก endpoint

```
(http.request.method eq "POST" and (http.user_agent contains "curl" or http.user_agent contains "python" or http.user_agent contains "wget" or http.user_agent contains "Go-http-client" or http.user_agent contains "PostmanRuntime" or http.user_agent contains "sqlmap" or http.user_agent contains "nikto" or http.user_agent contains "nmap"))
```

| Parameter  | Value              |
| ---------- | ------------------ |
| **Action** | Block              |

> **⚠️ ข้อควรระวัง:** ถ้าเว็บมี public API ที่ต้องรับ request จาก server/script อื่น (เช่น webhook)
> ห้ามใช้ rule นี้ เพราะจะ block integration ด้วย

---

### Rule 4: Path Traversal Block ✅ ใช้ได้กับทุกเว็บ

Block request ที่พยายาม directory traversal attack

```
(http.request.uri.path contains ".." or http.request.uri.path contains ".%2e" or http.request.uri.path contains "%2e." or http.request.uri.path contains "%2e%2e")
```

| Parameter  | Value              |
| ---------- | ------------------ |
| **Action** | Block              |

> `..` ใน URL path เป็นเทคนิค attack พื้นฐาน ไม่มี use case ปกติที่ต้องใช้

---

### Rule 5: Geo-Restrict Auth ❌ เฉพาะเว็บที่ user อยู่ในประเทศเดียว

Block การ login/signup จากนอกประเทศไทย

```
(starts_with(http.request.uri.path, "/api/auth/") and http.request.method eq "POST" and not ip.geoip.country eq "TH")
```

| Parameter  | Value              |
| ---------- | ------------------ |
| **Action** | Block              |

> **❌ ห้ามใช้ถ้ามี user ต่างประเทศ**
> ถ้าต้องการหลายประเทศ ปรับเป็น: `not ip.geoip.country in {"TH" "JP" "US"}`

---

### สรุปการใช้งาน 5 Rules

| # | Rule                   | ใช้กับทุกเว็บ | หมายเหตุ                          |
|---|------------------------|:-------------:|-----------------------------------|
| 1 | Scanner Path Block     | ✅            | ปลอดภัย ไม่มี false positive      |
| 2 | Non-Browser Auth POST  | ✅            | ทุกเว็บที่มีระบบ login             |
| 3 | Bot Tool Block         | ⚠️            | ห้ามใช้ถ้ามี public API/webhook   |
| 4 | Path Traversal Block   | ✅            | attack พื้นฐาน ควรมีทุกเว็บ       |
| 5 | Geo-Restrict Auth      | ❌            | เฉพาะเว็บที่ user อยู่ประเทศเดียว |

---

## 4. Free Features ที่ควรเปิด

### 4.1 Bot Fight Mode

**Path:** `Security → Bots → Bot Fight Mode → ON`

- กรอง known bot traffic อัตโนมัติ
- ไม่ใช้ rule quota
- **เปิดเลย ไม่มีเหตุผลที่จะปิด**

### 4.2 Security Level → Medium

**Path:** `Security → Settings → Security Level → Medium`

- Challenge เฉพาะ IP ที่มี threat score สูง (Cloudflare threat intelligence)
- ไม่กระทบ user ปกติ

### 4.3 Browser Integrity Check

**Path:** `Security → Settings → Browser Integrity Check → ON`

- ตรวจ HTTP headers ที่ bot มักไม่ส่ง
- Block request ที่มี user-agent ผิดปกติ

### 4.4 IP Access Rules

**Path:** `Security → WAF → Tools → IP Access Rules`

ถ้าเห็น IP ที่ยิงบ่อยจาก server log สามารถ block ได้ทันที:

- `xxx.xxx.xxx.xxx` → Action: Block (block IP เดียว)
- `xxx.xxx.xxx.0/24` → Action: Block (block ทั้ง range)

### 4.5 Under Attack Mode (ใช้เฉพาะเมื่อโดน DDoS)

**Path:** `Security → Overview → Under Attack Mode`

- Challenge ทุก request ด้วย JS challenge
- **ใช้เฉพาะตอนโดนโจมตีจริง** เพราะจะทำให้ user ทุกคนต้อง solve challenge

---

## 5. สิ่งที่ห้ามทำ

### ❌ ห้ามใช้ Managed Challenge กับ API endpoints

```
เช่น:
http.request.uri.path in {"/api/auth/callback/credentials" "/api/auth/signup"}
→ Action: Managed Challenge

❌ จะทำให้ login/signup พัง
```

**เหตุผล:** API endpoints ถูกเรียกผ่าน JavaScript `fetch()` จาก frontend
Managed Challenge ส่ง HTML challenge page กลับมา → `fetch()` render HTML ไม่ได้
→ ได้ HTML แทน JSON → NextAuth ตีความไม่ออก → **auth flow พังทั้งระบบ**

**กฎ:** Managed Challenge ใช้ได้กับ **page navigation** เท่านั้น (user เปิด URL ตรงๆ ใน browser)

---

## 6. Defense-in-Depth Overview

```
Request จาก Internet
        │
        ▼
┌──────────────────────────────┐
│  Cloudflare Edge (Free Plan) │
│                              │
│  ① Bot Fight Mode            │  กรอง known bots อัตโนมัติ
│  ② Security Level (Medium)   │  challenge high-threat IPs
│  ③ Browser Integrity Check   │  block fake user-agents
│  ④ Custom WAF Rules (5)      │  block scanner/bot/traversal
│  ⑤ Rate Limit Rule (1)       │  5 POST req/10s → /api/auth/*
│                              │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Nginx (Origin Server)      │
│  - Accept Cloudflare IP only │
│  - Buffer/Timeout management │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Next.js Application        │
│                              │
│  ⑥ CSRF Validation           │  middleware.ts
│  ⑦ App-Level Rate Limiting   │  lib/ratelimit.ts
│     - signin:      10/min    │
│     - signup:       5/min    │
│     - forgot-pw:    3/15min  │
│     - reset-pw:     5/15min  │
│     - project:     20/min    │
│     - doc-gen:     12/min    │
│  ⑧ Auth/Role Check           │  middleware.ts + NextAuth
│                              │
└──────────────────────────────┘
```

---

## Checklist

ใช้ checklist นี้ตอนตั้งค่า Cloudflare ให้เว็บใหม่:

- [ ] เปิด Bot Fight Mode
- [ ] ตั้ง Security Level → Medium
- [ ] เปิด Browser Integrity Check
- [ ] สร้าง Rate Limiting Rule (auth POST, 5 req/10s, Block)
- [ ] สร้าง Custom WAF Rule 1: Scanner Path Block
- [ ] สร้าง Custom WAF Rule 2: Non-Browser Auth POST
- [ ] สร้าง Custom WAF Rule 3: Bot Tool Block (ถ้าไม่มี public API)
- [ ] สร้าง Custom WAF Rule 4: Path Traversal Block
- [ ] สร้าง Custom WAF Rule 5: Geo-Restrict Auth (ถ้า user อยู่ประเทศเดียว)
