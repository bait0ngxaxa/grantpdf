# ภาพรวมโปรเจกต์ DOCX Generator

## 📋 ข้อมูลทั่วไป

- **ชื่อโปรเจกต์:** GRANT ONLINE
- **เวอร์ชัน:** 0.1.0 
- **ประเภท:** ระบบจัดการโครงการและเอกสารออนไลน์ (Document Management System)
- **วันที่สร้าง:** August 2025
- **วันที่อัปเดตล่าสุด:** September 25, 2025
- **สถานะ:** Production Ready ✅

## 🛠️ Tech Stack

### Core Framework
- **Framework:** [Next.js](https://nextjs.org/) v15.4.5 (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/) v5
- **Runtime:** Node.js

### Database & ORM
- **Database:** MySQL
- **ORM:** [Prisma](https://www.prisma.io/) v6.13.0
- **Database Client:** @prisma/client v6.13.0
- **Database Adapter:** @prisma/adapter-mariadb v6.14.0

### Authentication & Security
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) v4.24.11
- **Password Hashing:** bcryptjs v3.0.2
- **JWT:** jsonwebtoken v9.0.2, jose v6.0.12
- **Rate Limiting:** Custom implementation

### Frontend & Styling
- **CSS Framework:** [Tailwind CSS](https://tailwindcss.com/) v4.1.11
- **UI Components:** [DaisyUI](https://daisyui.com/) v5.0.50
- **Icons:** @heroicons/react v2.2.0, lucide-react v0.540.0
- **Dialogs:** @radix-ui/react-dialog v1.1.15
- **Slots:** @radix-ui/react-slot v1.2.3
- **Animations:** tw-animate-css v1.3.7
- **React:** v19.1.0

### Document Processing
- **PDF Processing:** [pdf-lib](https://pdf-lib.js.org/) v1.17.1
- **PDF Fonts:** @pdf-lib/fontkit v1.1.1, fontkit v2.0.4
- **Word Processing:** docxtemplater v3.65.3
- **Image Processing:** docxtemplater-image-module v3.1.0, docxtemplater-image-module-free v1.1.1
- **ZIP Handling:** pizzip v3.2.0

### Cloud Services
- **File Storage:** [Supabase](https://supabase.com/) v2.53.0
- **Email Service:** nodemailer v6.10.1

### Utilities
- **UUID Generation:** uuid v11.1.0
- **Cookie Handling:** cookie v1.0.2
- **Class Management:** clsx v2.1.1, class-variance-authority v0.7.1, tailwind-merge v3.3.1

## 📊 โครงสร้างโปรเจกต์

### 📁 Directory Structure
```
docxTemplate/
├── 📁 app/                         # Next.js App Router
│   ├── 📄 layout.tsx              # Root layout
│   ├── 📄 page.tsx                # Homepage
│   ├── 📄 globals.css             # Global styles
│   ├── 📁 api/                    # API Routes (10 main endpoints)
│   │   ├── 📁 auth/               # Authentication APIs (4 endpoints)
│   │   ├── 📁 admin/              # Admin management APIs (5 endpoints)
│   │   ├── 📁 user-docs/          # User document APIs (2 endpoints)
│   │   ├── 📁 fill-*-template/    # Template filling APIs (4 endpoints)
│   │   ├── 📁 projects/           # Project management APIs (2 endpoints)
│   │   ├── 📁 attachment/         # Attachment APIs (1 endpoint)
│   │   └── 📁 file-upload/        # File upload API (1 endpoint)
│   ├── 📁 admin/                  # Admin pages (2 pages)
│   │   ├── 📄 page.tsx            # Admin dashboard
│   │   ├── 📁 users/              # User management
│   │   └── 📁 components/         # Admin-specific components (8 components)
│   ├── 📁 create-word-*/          # Document creation pages (4 pages)
│   ├── 📁 userdashboard/          # User dashboard
│   │   ├── 📄 page.tsx            # User dashboard page
│   │   └── 📁 components/         # User dashboard components
│   ├── 📁 component/              # Session provider
│   └── 📁 [other-pages]/          # Other application pages (9 pages)
├── 📁 components/                 # Reusable UI components
│   ├── 📁 ui/                     # Custom UI components (7 components)
│   └── 📁 home/                   # Home page components
├── 📁 lib/                        # Utility libraries & configurations
│   ├── 📄 auth.ts                 # Authentication configuration
│   ├── 📄 prisma.ts               # Database client
│   ├── 📄 supabase.ts             # Supabase client
│   ├── 📄 ratelimit.ts            # Rate limiting
│   ├── 📄 fixParagraph.ts         # Text processing utilities
│   ├── 📄 text.ts                 # Text utilities
│   └── 📄 utils.ts                # General utilities
├── 📁 prisma/                     # Database schema & migrations
│   ├── 📄 schema.prisma           # Database schema
│   └── 📁 migrations/             # Database migrations (1 migration)
├── 📁 public/                     # Static assets
│   ├── 📁 font/                   # Thai fonts (2 fonts)
│   ├── 📄 *.docx                  # Document templates (4 templates)
│   └── 📄 *.png, *.jpg, *.svg     # Images and icons
├── 📁 hook/                       # Custom React hooks (1 hook)
├── 📁 type/                       # TypeScript type definitions (2 files)
├── 📄 middleware.ts               # Route protection middleware
├── 📄 server.js                   # Custom server configuration
└── 📄 components.json             # shadcn/ui configuration
```

### 📈 Project Statistics
- **Total Pages:** 17 pages (page.tsx files)
- **API Endpoints:** 16+ routes (route.ts files)
- **UI Components:** 15+ custom components
- **Database Models:** 4 models (User, Project, UserFile, AttachmentFile)
- **Template Types:** 4 document templates
- **Languages Supported:** Thai & English
- **Admin Components:** 8 specialized admin components
- **Utility Libraries:** 7 utility files

## 🔐 Database Schema

### User Model
```prisma
model User {
  id         Int       @id @default(autoincrement())
  name       String
  email      String    @unique
  password   String
  role       String    @default("member")
  created_at DateTime  @default(now()) @db.Timestamp(6)
  updated_at DateTime? @default(now()) @db.Timestamp(6)
  
  // Relations
  files      UserFile[]
  projects   Project[]
}
```
```

### Project Model  
```prisma
model Project {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  status      String    @default("กำลังดำเนินการ")
  created_at  DateTime  @default(now()) @db.Timestamp(6)
  updated_at  DateTime? @default(now()) @db.Timestamp(6)
  userId      Int
  
  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  files       UserFile[]
  
  @@index([userId])
}
```
```

### UserFile Model
```prisma
model UserFile {
  id               Int       @id @default(autoincrement())
  originalFileName String
  storagePath      String
  fileExtension    String
  downloadStatus   String    @default("pending")
  downloadedAt     DateTime?
  created_at       DateTime  @default(now()) @db.Timestamp(6)
  updated_at       DateTime? @default(now()) @db.Timestamp(6)
  userId           Int
  projectId        Int?
  
  // Relations  
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  project          Project?  @relation(fields: [projectId], references: [id], onDelete: SetNull)
  attachmentFiles  AttachmentFile[]
  
  @@index([userId])
  @@index([projectId])
}
```

### AttachmentFile Model
```prisma
model AttachmentFile {
  id       Int    @id @default(autoincrement())
  fileName String
  filePath String
  fileSize Int
  mimeType String
  
  created_at DateTime  @default(now()) @db.Timestamp(6)
  updated_at DateTime? @default(now()) @db.Timestamp(6)
  
  userFileId Int
  userFile   UserFile @relation(fields: [userFileId], references: [id], onDelete: Cascade)
  
  @@index([userFileId])
}
```

## 🚀 ฟีเจอร์หลัก

### 🔑 Authentication & User Management
- **User Registration & Login** - ระบบสมัครสมาชิกและเข้าสู่ระบบ
- **Role-based Access Control** - จัดการสิทธิ์ผู้ใช้ (User/Admin)
- **Password Reset** - รีเซ็ตรหัสผ่านผ่านอีเมล
- **Session Management** - จัดการ session ด้วย JWT
- **Profile Management** - จัดการข้อมูลส่วนตัว

### 📄 Document Management  
- **File Upload** - อัปโหลดเอกสาร (PDF, Word)
- **File Preview** - พรีวิวเอกสารออนไลน์
- **File Download** - ดาวน์โหลดเอกสาร
- **File Search & Filter** - ค้นหาและกรองเอกสาร
- **File Organization** - จัดกลุ่มเอกสารตามโครงการ
- **Download Status Tracking** - ติดตามสถานะการดาวน์โหลด

### 📝 Document Creation & Templates
- **PDF Template Filling** - กรอกข้อมูลในเทมเพลต PDF (Coming soon)
- **Word Template Processing** - สร้างเอกสาร Word จากเทมเพลต
- **Multiple Template Types:**
  - 📋 TOR (Terms of Reference) - ขอบเขตการดำเนินงาน  
  - 📋 Contract - สัญญาจ้าง
  - 📋 Approval - เอกสารอนุมัติ
  - 📋 Form Project - แบบฟอร์มโครงการ
- **Thai Language Support** - รองรับภาษาไทยเต็มรูปแบบ
- **Dynamic Data Injection** - แทรกข้อมูลแบบไดนามิก

### 👤 User Dashboard
- **Personal File Management** - จัดการไฟล์ส่วนตัว
- **Project Organization** - จัดกลุ่มไฟล์ตามโครงการ
- **Search & Sort** - ค้นหาและเรียงลำดับเอกสาร
- **File Statistics** - สถิติการใช้งาน
- **Recent Activities** - กิจกรรมล่าสุด

### ⚙️ Admin Panel
- **User Management** - จัดการผู้ใช้ทั้งหมด
- **System Overview** - ภาพรวมระบบ
- **File Management** - จัดการโครงการและไฟล์ทั้งหมดในระบบ
- **Download Monitoring** - ติดตามการดาวน์โหลด
- **System Statistics** - สถิติระบบ

## 🔧 API Endpoints

### Authentication APIs
- `POST /api/auth/signup` - สมัครสมาชิก
- `POST /api/auth/forgot-password` - ลืมรหัสผ่าน  
- `POST /api/auth/reset-password` - รีเซ็ตรหัสผ่าน
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### User Document APIs
- `GET /api/user-docs` - ดึงเอกสารของผู้ใช้
- `POST /api/user-docs` - อัปโหลดเอกสารใหม่
- `GET /api/user-docs/download/[id]` - ดาวน์โหลดเอกสาร

### Template Processing APIs
- `POST /api/fill-tor-template` - สร้างเอกสาร TOR
- `POST /api/fill-contract-template` - สร้างสัญญาจ้าง
- `POST /api/fill-approval-template` - สร้างเอกสารอนุมัติ
- `POST /api/fill-formproject-template` - สร้างฟอร์มโครงการ

### Admin APIs
- `GET /api/admin/dashboard` - ข้อมูลแดชบอร์ด
- `DELETE /api/admin/dashboard/file/[id]` - ลบไฟล์
- `GET /api/admin/download/[id]` - ดาวน์โหลดไฟล์ (Admin)
- `GET /api/admin/preview/[filename]` - พรีวิวไฟล์
- `GET /api/admin/projects` - จัดการโครงการ (Admin)
- `GET /api/admin/users` - รายการผู้ใช้
- `PUT /api/admin/users/[id]` - อัปเดตผู้ใช้

### Project Management APIs
- `GET/POST /api/projects` - จัดการโครงการ
- `PUT/DELETE /api/projects/[id]` - อัปเดต/ลบโครงการ

### Attachment APIs
- `GET /api/attachment/download/[id]` - ดาวน์โหลดไฟล์แนบ

### File Upload API
- `POST /api/file-upload` - อัปโหลดไฟล์

## 🎨 UI/UX Features

### Design System
- **Modern UI** - ดีไซน์ทันสมัยด้วย Tailwind CSS + DaisyUI
- **Responsive Design** - รองรับทุกขนาดหน้าจอ
- **Thai Typography** - ฟอนต์ภาษาไทยที่สวยงาม (fonts ในโฟลเดอร์ public/font/)
- **Component System** - ระบบคอมโพเนนต์ที่ยืดหยุ่นด้วย shadcn/ui
- **Card-based Layout** - เลย์เอาต์แบบการ์ดสำหรับการจัดการโครงการ
<!-- - **Dark/Light Mode** - รองรับธีมมืด/สว่าง
- **Accessibility** - รองรับการเข้าถึงสำหรับผู้พิการ -->

### Interactive Components
- **Modal Dialogs** - กล่องโต้ตอบแบบโมดอลด้วย Radix UI
- **File Drag & Drop** - ลากและวางไฟล์
- **Real-time Search** - ค้นหาและกรองแบบ real-time
- **Project Cards** - การ์ดโครงการที่ขยายได้
- **Attachment Lists** - รายการไฟล์แนบที่จัดการได้
- **Loading Spinners** - สถานะการโหลดข้อมูล
- **Empty States** - สถานะเมื่อไม่มีข้อมูล
- **Search and Filter** - ระบบค้นหาและกรองขั้นสูง
- **Error Handling** - จัดการข้อผิดพลาด

## 🔒 Security Features

### Authentication Security
- **JWT Tokens** - ระบบ token ที่ปลอดภัย
- **Password Hashing** - เข้ารหัสรหัสผ่านด้วย bcrypt
- **Session Validation** - ตรวจสอบ session ที่เซิร์ฟเวอร์
- **Route Protection** - ป้องกันเส้นทางด้วย middleware

### File Security  
- **Upload Validation** - ตรวจสอบประเภทและขนาดไฟล์
- **Path Sanitization** - ป้องกัน directory traversal
- **User Isolation** - ผู้ใช้เข้าถึงได้เฉพาะไฟล์ของตัวเอง
- **Role-based Access** - ควบคุมการเข้าถึงตามบทบาท

### API Security
- **Rate Limiting** - จำกัดการเรียก API
- **Input Validation** - ตรวจสอบข้อมูลนำเข้า
- **CORS Protection** - ป้องกัน Cross-Origin attacks
- **Error Sanitization** - ซ่อนข้อมูลระบบจากข้อผิดพลาด

## 📦 Scripts & Commands

```bash
# Development
npm run dev          # เริ่ม development server (with Turbopack)

# Production  
npm run build        # สร้าง production build
npm run start        # เริ่ม production server

# Code Quality
npm run lint         # รัน ESLint
```

## 📊 Performance & Optimization

### Built-in Optimizations
- **Next.js 15** - ล่าสุดและเร็วที่สุด
- **Turbopack** - Fast development bundler
- **Image Optimization** - อัปโหลดและแสดงรูปภาพที่เหมาะสม
- **Code Splitting** - แยกโค้ดอัตโนมัติ
- **Static Generation** - สร้างหน้าเว็บแบบ static
- **API Route Optimization** - เพิ่มประสิทธิภาพ API

### Database Optimizations
- **Prisma ORM** - Query optimization
- **Database Indexing** - ดัชนีฐานข้อมูล
- **Connection Pooling** - การจัดการการเชื่อมต่อ
- **Query Optimization** - เพิ่มประสิทธิภาพ query

## 🔄 Version History

### v0.1.0 (Current)
- ✅ เปิดตัวระบบครั้งแรก
- ✅ ระบบ Authentication ครบถ้วน
- ✅ ระบบจัดการเอกสารสมบูรณ์
- ✅ ระบบ Template Processing ทั้ง 4 ประเภท
- ✅ Admin Panel ครบฟีเจอร์
- ✅ รองรับภาษาไทยเต็มรูปแบบ
- ✅ Responsive Design

## 🎯 Future Roadmap

### Phase 2 (Planned)
- 📧 **Email Notifications** - ระบบแจ้งเตือนทางอีเมล
- 🔄 **File Versioning** - จัดการเวอร์ชันเอกสาร
- 👥 **File Sharing** - แชร์ไฟล์ระหว่างผู้ใช้
- 📊 **Advanced Analytics** - รายงานและสถิติขั้นสูง
- 🔍 **Full-text Search** - ค้นหาเนื้อหาในเอกสาร

### Phase 3 (Future)
- 🤖 **AI Integration** - ระบบ AI ช่วยจัดการเอกสาร
- 🔗 **API Integration** - เชื่อมต่อระบบภายนอก
- 📱 **Mobile App** - แอปพลิเคชันมือถือ
- ☁️ **Multi-cloud Support** - รองรับ cloud หลายตัว
- 🌍 **Multi-language** - รองรับหลายภาษา

---

## 📞 Support & Contact

สำหรับคำถามหรือการสนับสนุน กรุณาติดต่อทีมพัฒนา IT NHF


*อัปเดตล่าสุด: 25 กันยายน 2025*
