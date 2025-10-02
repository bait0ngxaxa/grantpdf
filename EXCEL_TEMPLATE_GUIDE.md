# Excel Template Guide - แบบสรุปโครงการ

## การใช้งาน Excel Template

### ไฟล์ Template
- **ตำแหน่ง**: `public/summary.xlsx`
- **รูปแบบ**: ไฟล์ต้องเป็น `.xlsx` (Excel 2007+) **ไม่ใช่** `.xls` (Excel 97-2003)

### Placeholders ที่รองรับ

ใส่ placeholders เหล่านี้ในเซลล์ของ Excel template:

```
{{projectName}}       - ชื่อโครงการ
{{contractNumber}}    - เลขที่สัญญา
{{organize}}          - หน่วยงาน
{{projectOwner}}      - เจ้าของโครงการ
{{projectReview}}     - ผู้ตรวจสอบโครงการ
{{inspector}}         - ผู้ตรวจการ
{{coordinator}}       - ผู้ประสานงาน
{{currentDate}}       - วันที่ปัจจุบัน (รูปแบบไทย)
{{currentYear}}       - ปีปัจจุบัน (พ.ศ.)
```

### ตัวอย่างการใช้งานใน Excel

| คอลัมน์ A | คอลัมน์ B |
|-----------|-----------|
| ชื่อโครงการ: | {{projectName}} |
| เลขที่สัญญา: | {{contractNumber}} |
| หน่วยงาน: | {{organize}} |
| เจ้าของโครงการ: | {{projectOwner}} |

### การทำงาน

1. ระบบจะอ่านไฟล์ `public/summary.xlsx`
2. สแกนทุกเซลล์ในแผ่นงานแรก
3. แทนที่ placeholders ด้วยข้อมูลจริง
4. รองรับ:
   - เซลล์ข้อความธรรมดา
   - Rich text (ข้อความที่มีการจัดรูปแบบ)
   - สูตร (formulas)

### การแปลงไฟล์ .xls เป็น .xlsx

หากคุณมีไฟล์ `.xls` อยู่:

1. เปิดไฟล์ใน Microsoft Excel
2. ไปที่ File > Save As
3. เลือก "Excel Workbook (*.xlsx)"
4. บันทึกเป็น `summary.xlsx`
5. วางไฟล์ใน folder `public/`

### API Endpoint

- **URL**: `/api/fill-excel-summary-template`
- **Method**: POST
- **Body**:
```json
{
  "projectId": "string (optional)",
  "summaryData": {
    "projectName": "string",
    "contractNumber": "string",
    "organize": "string",
    "projectOwner": "string",
    "projectReview": "string",
    "inspector": "string",
    "coordinator": "string"
  }
}
```

### หน้า Frontend

- **URL**: `/create-word-summary`
- **คำอธิบาย**: หน้าฟอร์มสำหรับกรอกข้อมูลและสร้างเอกสาร Excel

### การแก้ไขปัญหา

#### ปัญหา: Template file not found
- ตรวจสอบว่ามีไฟล์ `public/summary.xlsx` อยู่จริง
- ตรวจสอบว่าเป็นไฟล์ `.xlsx` ไม่ใช่ `.xls`

#### ปัญหา: No worksheet found
- เปิดไฟล์ Excel และตรวจสอบว่ามีแผ่นงาน (sheet) อย่างน้อย 1 แผ่น

#### ปัญหา: Placeholders ไม่ถูกแทนที่
- ตรวจสอบว่า placeholder เขียนถูกต้อง: `{{key}}` (ใช้วงเล็บปีกกาคู่)
- ตรวจสอบว่าชื่อ key ตรงกับที่กำหนดไว้
- ตรวจสอบว่าไม่มีช่องว่างภายในวงเล็บปีกกา
