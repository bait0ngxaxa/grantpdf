# GRANT ONLINE — ระบบจัดการโครงการและเอกสารออนไลน์

ระบบสำหรับสร้างและจัดการเอกสารโครงการ ติดตามสถานะ อัปโหลด/ดาวน์โหลดไฟล์ และบริหารผู้ใช้ แบ่งสิทธิ์เป็นสมาชิกและผู้ดูแลระบบ

## ความสามารถหลัก

- สร้างเอกสาร TOR, สัญญาจ้าง, หนังสืออนุมัติ, ข้อเสนอโครงการ และแบบสรุปโครงการ
- จัดเก็บไฟล์ตามโครงการ รองรับ DOC, DOCX, PDF, XLS และ XLSX (สูงสุด 15 MB ต่อไฟล์)
- แดชบอร์ดสมาชิกและผู้ดูแลระบบ พร้อมค้นหา กรอง แบ่งหน้า และติดตามสถานะ
- ระบบยืนยันตัวตนที่พัฒนาในโปรเจกต์ด้วย access/refresh token, secure cookie และ session ในฐานข้อมูล
- ส่งอีเมลรีเซ็ตรหัสผ่านผ่าน SMTP
- rate limit และ cache ด้วย Redis (production ควรเปิดใช้งาน)
- ลบไฟล์แบบ reconciliation เพื่อให้ข้อมูลในฐานข้อมูลและไฟล์บนดิสก์สอดคล้องกัน

## เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
| --- | --- |
| Web | Next.js 15 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, Radix UI, Lucide React, Tiptap |
| Data fetching | SWR |
| API และ validation | Next.js Route Handlers, Zod 4 |
| Authentication | JWT (`jose`/`jsonwebtoken`), bcryptjs, database-backed sessions |
| Database | MySQL 8, Prisma ORM 6 |
| Cache / rate limit | Redis 7 |
| เอกสาร | docxtemplater, PizZip, ExcelJS |
| Testing | Vitest, Testing Library |
| Edge / proxy | Cloudflare, Nginx |

> โปรเจกต์นี้ไม่ได้ใช้ NextAuth.js หรือ DaisyUI และ Docker Compose ปัจจุบันรันเฉพาะ MySQL กับ Redis แอป Next.js รันบน host

## เริ่มต้นพัฒนาในเครื่อง

### สิ่งที่ต้องมี

- Node.js 22 LTS และ npm
- Docker Engine พร้อม Docker Compose plugin (หรือ MySQL 8 และ Redis 7 ที่ติดตั้งเอง)
- ฟอนต์และ template เอกสารใน `public/` ซึ่งอยู่ใน repository แล้ว

### ติดตั้ง

```bash
npm ci
cp .env.example .env
docker compose up -d mysql redis
npx prisma generate
npx prisma migrate deploy
npm run dev
```

บน Windows PowerShell ใช้ `Copy-Item .env.example .env` แทน `cp` แล้วเปิด <http://localhost:3000>

ค่า `DATABASE_URL` สำหรับ compose ชุดพัฒนาต้องเชื่อมผ่าน port `3307` ของ host ส่วน Redis ใช้ `6379` ดูรายละเอียดและตัวอย่างค่าทั้งหมดใน [.env.example](.env.example)

หากเป็นฐานข้อมูลใหม่และต้องการข้อมูลโครงการตั้งต้น สามารถรัน seed แบบ idempotent ได้ด้วย:

```bash
npx --yes tsx prisma/seed-programs.ts
```

## คำสั่งที่ใช้บ่อย

```bash
npm run dev            # development server
npm run lint           # lint
npx tsc --noEmit       # typecheck
npm test               # test suite
npm run test:coverage  # test พร้อม coverage
```

## Deploy

คู่มือ production แบบครบขั้นตอนอยู่ที่ [deploy/README.md](deploy/README.md) ครอบคลุมการเตรียม server/env, database migration, persistent storage, systemd, Nginx/Cloudflare, health check, update และ backup

เอกสารเฉพาะส่วน:

- [ติดตั้ง Nginx](deploy/nginx/README.md)
- [Cloudflare Origin SSL](deploy/nginx-cloudflare-origin-ssl.md)
- [Cloudflare Free Plan Security](deploy/cloudflare-free-plan-security.md)

## ข้อมูลที่ต้องสำรอง

สำรองทั้งสองส่วนพร้อมกันเสมอ:

- MySQL volume/database — metadata, ผู้ใช้, session และตำแหน่งไฟล์
- `storage/` — เอกสาร ไฟล์แนบ รายงาน และไฟล์ชั่วคราวระหว่างประมวลผล

การสำรองเพียงฐานข้อมูลหรือเพียงไฟล์อย่างเดียวไม่เพียงพอสำหรับกู้ระบบให้สอดคล้องกัน

## ติดต่อ

ทีมพัฒนา IT Development NHF

_อัปเดตล่าสุด: 23 กรกฎาคม 2026_
