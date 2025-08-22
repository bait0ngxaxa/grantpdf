# โปรเจค Grant to PDF - Context และภาพรวมทั้งหมด

## 📋 ภาพรวมโปรเจค

**Grant to PDF** เป็นระบบจัดการเอกสารออนไลน์ที่พัฒนาด้วย Next.js 14 และ TypeScript โดยมีวัตถุประสงค์หลักในการจัดการเอกสารประเภทต่างๆ เช่น สัญญาจ้าง ขอบเขตการดำเนินงาน (TORS) และเอกสารอื่นๆ ที่เกี่ยวข้องกับการบริหารโครงการ

## 🏗️ สถาปัตยกรรมระบบ

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Authentication**: NextAuth.js

### Backend
- **Runtime**: Node.js
- **Database**: Prisma ORM + PostgreSQL
- **File Storage**: Local file system (uploads folder)
- **API**: Next.js API Routes

### Database Schema
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model UserFile {
  id               String   @id @default(cuid())
  originalFileName String
  storagePath      String
  fileExtension    String
  userId           String
  userName         String
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
}
```

## 🔐 ระบบ Authentication และ Authorization

### NextAuth.js Configuration
- **Providers**: Credentials (email/password)
- **Session Strategy**: JWT
- **Role-based Access Control**:
  - `user`: ผู้ใช้ทั่วไป (เข้าถึง userdashboard)
  - `admin`: ผู้ดูแลระบบ (เข้าถึง admin dashboard)

### Protected Routes
- `/userdashboard` - สำหรับผู้ใช้ทั่วไป
- `/admin/*` - สำหรับผู้ดูแลระบบ
- `/api/admin/*` - API สำหรับผู้ดูแลระบบ

## 📁 โครงสร้างไฟล์และโฟลเดอร์

```
grant_to_pdf/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── admin/              # Admin APIs
│   │   │   ├── dashboard/      # Admin dashboard APIs
│   │   │   └── users/          # User management APIs
│   │   ├── auth/               # Authentication APIs
│   │   ├── fill-pdf-template/  # PDF template filling
│   │   ├── fill-word-template/ # Word template filling
│   │   └── user-docs/          # User documents API
│   ├── admin/                  # Admin pages
│   ├── userdashboard/          # User dashboard
│   ├── createdocs/             # Document creation
│   ├── signin/                 # Sign in page
│   ├── signup/                 # Sign up page
│   └── layout.tsx              # Root layout
├── components/                  # Reusable UI components
├── lib/                        # Utility libraries
├── prisma/                     # Database schema & migrations
└── public/                     # Static assets
```

## 🚀 ฟีเจอร์หลัก

### 1. ระบบจัดการผู้ใช้
- **Registration**: สมัครสมาชิกใหม่
- **Authentication**: เข้าสู่ระบบ/ออกจากระบบ
- **Profile Management**: จัดการข้อมูลส่วนตัว
- **Role Management**: จัดการสิทธิ์ผู้ใช้

### 2. ระบบจัดการเอกสาร
- **Document Upload**: อัปโหลดเอกสาร
- **Document Preview**: พรีวิวเอกสาร (PDF, Word)
- **Document Search**: ค้นหาเอกสาร
- **Document Sorting**: เรียงลำดับเอกสาร
- **Document Deletion**: ลบเอกสาร

### 3. ระบบจัดการเทมเพลต
- **PDF Template Filling**: กรอกข้อมูลในเทมเพลต PDF
- **Word Template Filling**: กรอกข้อมูลในเทมเพลต Word
- **Template Management**: จัดการเทมเพลต

### 4. แผงควบคุมแอดมิน
- **User Management**: จัดการผู้ใช้
- **Document Overview**: ภาพรวมเอกสารทั้งหมด
- **System Statistics**: สถิติระบบ

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - สมัครสมาชิก
- `POST /api/auth/forgot-password` - ลืมรหัสผ่าน
- `POST /api/auth/reset-password` - รีเซ็ตรหัสผ่าน

### User Documents
- `GET /api/user-docs` - ดึงเอกสารของผู้ใช้
- `POST /api/user-docs` - อัปโหลดเอกสารใหม่

### Admin
- `GET /api/admin/dashboard` - ข้อมูลแดชบอร์ดแอดมิน
- `DELETE /api/admin/dashboard/file/[id]` - ลบไฟล์
- `GET /api/admin/users` - รายชื่อผู้ใช้ทั้งหมด
- `PUT /api/admin/users/[id]` - อัปเดตข้อมูลผู้ใช้

### Document Processing
- `POST /api/fill-pdf-template` - กรอกข้อมูลในเทมเพลต PDF
- `POST /api/fill-word-template` - กรอกข้อมูลในเทมเพลต Word

## 🎨 UI/UX Design

### Design System
- **Color Scheme**: Blue-Purple gradient theme
- **Typography**: Thai font support (Noto Sans Thai, TH Sarabun)
- **Components**: DaisyUI components + Custom Tailwind classes
- **Responsive**: Mobile-first design approach

### Key UI Components
- **Navigation Bar**: Logo, menu, user profile dropdown
- **Sidebar**: Department filtering
- **Data Table**: Document listing with actions
- **Modals**: Profile, preview, confirmation dialogs
- **Forms**: Search, filter, sort controls

## 📊 การจัดการข้อมูล

### State Management
- **Local State**: useState สำหรับ component state
- **API State**: การจัดการ loading, error, success states
- **Filtering & Sorting**: useMemo สำหรับการประมวลผลข้อมูล

### Data Flow
1. **User Authentication** → Session creation
2. **Document Fetching** → API call → State update
3. **User Actions** → API call → Local state update
4. **Real-time Updates** → Immediate UI feedback

## 🔒 ความปลอดภัย

### Authentication Security
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt encryption
- **Session Validation**: Server-side verification

### Authorization
- **Role-based Access**: User vs Admin permissions
- **Route Protection**: Middleware-based access control
- **API Security**: Session validation on all protected endpoints

### File Security
- **Upload Validation**: File type and size restrictions
- **Path Sanitization**: Prevent directory traversal attacks
- **User Isolation**: Users can only access their own files

## 🚀 การ Deploy และ Production

### Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Build Process
```bash
npm run build    # Build production version
npm run start    # Start production server
npm run dev      # Development mode
```

## 📈 การพัฒนาต่อ

### Planned Features
- **File Sharing**: แชร์ไฟล์ระหว่างผู้ใช้
- **Version Control**: จัดการเวอร์ชันเอกสาร
- **Audit Trail**: ติดตามการเปลี่ยนแปลง
- **Bulk Operations**: จัดการหลายไฟล์พร้อมกัน
- **Advanced Search**: ค้นหาขั้นสูง (ตามเนื้อหา, วันที่, ประเภท)

### Technical Improvements
- **File Storage**: ย้ายไปใช้ cloud storage (AWS S3, Google Cloud)
- **Caching**: Redis caching สำหรับ performance
- **Real-time**: WebSocket สำหรับ real-time updates
- **Testing**: Unit tests และ integration tests
- **CI/CD**: Automated deployment pipeline

## 🐛 การแก้ไขปัญหา

### Common Issues
1. **Authentication Errors**: ตรวจสอบ session และ role
2. **File Upload Failures**: ตรวจสอบ file size และ type
3. **Database Connection**: ตรวจสอบ Prisma connection
4. **CORS Issues**: ตรวจสอบ API route configuration

### Debug Tools
- **Console Logging**: Detailed error logging
- **Prisma Studio**: Database inspection tool
- **Next.js DevTools**: Development debugging

## 📚 Dependencies

### Core Dependencies
```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "prisma": "5.x",
  "next-auth": "4.x",
  "tailwindcss": "3.x",
  "daisyui": "4.x"
}
```

### Development Dependencies
```json
{
  "@types/node": "20.x",
  "@types/react": "18.x",
  "eslint": "8.x",
  "postcss": "8.x",
  "autoprefixer": "10.x"
}
```

## 🤝 การมีส่วนร่วม

### Development Workflow
1. **Feature Branch**: สร้าง branch ใหม่สำหรับแต่ละ feature
2. **Code Review**: Peer review ก่อน merge
3. **Testing**: Test ใน development environment
4. **Documentation**: อัปเดตเอกสารเมื่อมีการเปลี่ยนแปลง

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Git commit message format

---

*เอกสารนี้สร้างขึ้นเพื่อให้ทีมพัฒนาและผู้เกี่ยวข้องเข้าใจภาพรวมของโปรเจค Grant to PDF โดยละเอียด*
