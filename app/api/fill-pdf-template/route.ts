// เส้นเขียนไฟล์ PDF บันทึกลง db storage (แบบ local file system)
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { projectName, clientName, description, userId } = await request.json();

    // ตรวจสอบว่ามี userId หรือไม่
    if (!userId) {
      return NextResponse.json({
        error: 'ต้องระบุ userId'
      }, { status: 400 });
    }

    // --- 1. Load PDF Template ---
    const templatePath = '/testpdf.pdf';
    const templateUrl = new URL(templatePath, request.url).href;

    const formPdfBytes = await fetch(templateUrl).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch PDF template from ${templateUrl}: ${res.statusText}`);
      return res.arrayBuffer();
    });

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    // --- 2. Load & Embed Thai Font ---
    const fontPath = '/font/THSarabun.ttf';
    const fontUrl = new URL(fontPath, request.url).href;

    const fontBytes = await fetch(fontUrl).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch font from ${fontUrl}: ${res.statusText}`);
      return res.arrayBuffer();
    });

    const thaiFont = await pdfDoc.embedFont(fontBytes);

    // --- 3. เขียนข้อความด้วยตำแหน่ง ---
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const fontSize = 16;
    const textColor = rgb(0, 0, 0);

    firstPage.drawText(projectName, {
      x: 115.2,
      y: 753.84,
      size: fontSize,
      font: thaiFont,
      color: textColor,
    });

    firstPage.drawText(clientName, {
      x: 115.2,
      y: 721.44,
      size: fontSize,
      font: thaiFont,
      color: textColor,
    });

    firstPage.drawText(description, {
      x: 147.6,
      y: 657.36,
      size: fontSize,
      font: thaiFont,
      color: textColor,
      maxWidth: 500,
      lineHeight: 14,
    });

    // --- 4. Save PDF ---
    const pdfBytes = await pdfDoc.save();

    // --- 5. สร้างชื่อไฟล์และ path ---
    const sanitizedProjectName = projectName
      .replace(/\s+/g, '_')
      .replace(/[^\x00-\x7F]/g, '');

    const safeName = sanitizedProjectName || 'document';
    const uniqueFileName = `${safeName}_${uuidv4()}.pdf`;
    
    // สร้าง path สำหรับบันทึกไฟล์
    const publicPdfDir = path.join(process.cwd(), 'public', 'upload' ,'pdf');
    const filePath = path.join(publicPdfDir, uniqueFileName);
    const storagePath = `/upload/pdf/${uniqueFileName}`; // path ที่จะเก็บใน database

    // --- 6. สร้างโฟลเดอร์ถ้ายังไม่มี ---
    if (!existsSync(publicPdfDir)) {
      await mkdir(publicPdfDir, { recursive: true });
    }

    // --- 7. บันทึกไฟล์ลงในระบบ ---
    await writeFile(filePath, pdfBytes);

    // --- 8. บันทึกข้อมูลลงฐานข้อมูล ---
    try {
      const userFile = await prisma.userFile.create({
        data: {
          originalFileName: `${projectName}_${Date.now()}.pdf`,
          storagePath: storagePath,
          fileExtension: 'pdf',
          userId: parseInt(userId), // แปลง userId เป็น int
        }
      });

      // --- 9. สร้าง Public URL ---
      const publicUrl = `${request.nextUrl.origin}${storagePath}`;

      return NextResponse.json({
        message: 'สร้างเอกสาร PDF สำเร็จ',
        pdfUrl: publicUrl,
        fileRecord: userFile
      }, { status: 200 });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // ลบไฟล์ออกถ้าบันทึกฐานข้อมูลไม่สำเร็จ
      try {
        const { unlink } = await import('fs/promises');
        await unlink(filePath);
      } catch (unlinkError) {
        console.error('Failed to delete file after database error:', unlinkError);
      }

      return NextResponse.json({
        error: 'ไม่สามารถบันทึกข้อมูลไฟล์ลงฐานข้อมูลได้'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Unexpected error in fill-pdf-template API:', error);

    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch font')) {
        return NextResponse.json({ 
          error: `ไม่สามารถโหลดไฟล์ฟอนต์: ${error.message}` 
        }, { status: 500 });
      }
      if (error.message.includes('Failed to fetch PDF template')) {
        return NextResponse.json({ 
          error: `ไม่สามารถโหลด PDF Template: ${error.message}` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการสร้างเอกสาร PDF' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}