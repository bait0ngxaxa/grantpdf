
# ภาพรวมโปรเจกต์ Grant to PDF

## 1. ข้อมูลทั่วไป

*   **ชื่อโปรเจกต์:** grant_to_pdf
*   **เวอร์ชัน:** 0.1.0
*   **ประเภท:** เว็บแอปพลิเคชัน

## 2. เทคโนโลยีที่ใช้ (Tech Stack)

*   **Framework:** [Next.js](https://nextjs.org/) (v15.4.5)
*   **ภาษา:** [TypeScript](https://www.typescriptlang.org/) (v5)
*   **ฐานข้อมูล:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Prisma](https://www.prisma.io/) (v6.13.0)
*   **การยืนยันตัวตน (Authentication):** [NextAuth.js](https://next-auth.js.org/) (v4.24.11)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4.1.11)
*   **UI Components:** [daisyUI](https://daisyui.com/) (v5.0.50)
*   **การจัดการ PDF:** [pdf-lib](https://pdf-lib.js.org/) (v1.17.1)
*   **File Storage:** [Supabase](https://supabase.com/)
*   **Deployment:** (ยังไม่ระบุ)

## 3. โครงสร้างโปรเจกต์

```
C:/Users/Bait0ng/Desktop/Grant PDF/grant_to_pdf/
├───.gitignore
├───middleware.ts
├───next.config.ts
├───package.json
├───package-lock.json
├───postcss.config.mjs
├───README.md
├───tsconfig.json
├───app/
│   ├───favicon.ico
│   ├───globals.css
│   ├───layout.tsx
│   ├───page.tsx
│   ├───access-denied/
│   │   └───page.tsx
│   ├───admin/
│   │   ├───page.tsx
│   │   └───users/
│   │       └───page.tsx
│   ├───api/
│   │   ├───admin/
│   │   │   └───users/
│   │   │       ├───route.ts
│   │   │       └───[id]/
│   │   │           └───route.ts
│   │   ├───auth/
│   │   │   ├───[...nextauth]/
│   │   │   │   └───route.ts
│   │   │   └───signup/
│   │   │       └───route.ts
│   │   ├───createfile/
│   │   │   └───route.ts
│   │   ├───fill-pdf-template/
│   │   │   └───route.ts
│   │   ├───fill-pdf-template2/
│   │   │   └───route.ts
│   │   └───upload/
│   │       └───route.ts
│   ├───component/
│   │   └───SessionProvider.tsx
│   ├───createdocs/
│   │   └───page.tsx
│   ├───form/
│   │   └───page.tsx
│   ├───profile/
│   │   └───page.tsx
│   ├───signin/
│   │   └───page.tsx
│   ├───signup/
│   │   └───page.tsx
│   ├───test-field/
│   │   └───page.tsx
│   ├───upload/
│   │   └───page.tsx
│   └───userdashboard/
│       └───page.tsx
├───lib/
│   ├───prisma.ts
│   ├───supabase.ts
│   └───generated/
│       └───prisma/...
├───prisma/
│   ├───schema.prisma
│   └───migrations/
│       ├───migration_lock.toml
│       └───20250806032624_init/
│           └───migration.sql
├───public/
│   ├───file.svg
│   ├───globe.svg
│   ├───next.svg
│   ├───testpdf2.pdf
│   ├───testpdf.pdf
│   ├───vercel.svg
│   ├───window.svg
│   ├───contract/
│   └───font/
│       ├───NotoSansThai-Regular.ttf
│       └───THSarabun.ttf
└───type/
    └───next-auth.d.ts
```

## 4. Scripts

*   `npm run dev`: เริ่ม development server ด้วย Turbopack
*   `npm run build`: สร้าง production build
*   `npm run start`: เริ่ม production server
*   `npm run lint`: รัน linter (Next.js)

## 5. Database Schema (Prisma)

*   **Model:** `users`
    *   `id`: BigInt (Primary Key, Autoincrement)
    *   `name`: String
    *   `email`: String (Unique)
    *   `password`: String
    *   `role`: String (Default: "member")
    *   `created_at`: DateTime (Default: now())
    *   `updated_at`: DateTime (Optional, Default: now())

## 6. สรุปความสามารถหลัก

จากโครงสร้างไฟล์และ dependencies โปรเจกต์นี้เป็นเว็บแอปพลิเคชันที่พัฒนาด้วย Next.js มีความสามารถหลักๆ ดังนี้:

*   **ระบบสมาชิก:**
    *   สมัครสมาชิก (`/signup`)
    *   เข้าสู่ระบบ (`/signin`)
    *   จัดการโปรไฟล์ (`/profile`)
    *   ใช้ NextAuth.js ในการจัดการ session และ authentication
*   **ระบบจัดการผู้ใช้ (Admin):**
    *   หน้าสำหรับแอดมิน (`/admin`)
    *   จัดการผู้ใช้ (`/admin/users`)
    *   มี API สำหรับจัดการข้อมูลผู้ใช้ (CRUD)
*   **การจัดการเอกสาร PDF:**
    *   อัปโหลดไฟล์ (`/upload`)
    *   สร้างเอกสาร (`/createdocs`)
    *   กรอกข้อมูลลงในเทมเพลต PDF (`/api/fill-pdf-template`, `/api/fill-pdf-template2`)
    *   ใช้ `pdf-lib` ในการจัดการไฟล์ PDF
*   **การเชื่อมต่อฐานข้อมูล:**
    *   ใช้ Prisma เป็น ORM ในการเชื่อมต่อกับฐานข้อมูล PostgreSQL
*   **File Storage:**
    *   ใช้ Supabase ในการจัดเก็บไฟล์

