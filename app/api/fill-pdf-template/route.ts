// เส้นเขียนไฟล์ PDF บันทึกลง db storage
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { projectName, clientName, description } = await request.json();

    // --- 1. Load PDF Template ---
    const templatePath = '/testpdf.pdf'; // ปรับ path ให้ถูกต้องตามไฟล์จริงของคุณ
    const templateUrl = new URL(templatePath, request.url).href;

    const formPdfBytes = await fetch(templateUrl).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch PDF template from ${templateUrl}: ${res.statusText}`);
      return res.arrayBuffer();
    });

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    // --- 2. Load & Embed Thai Font ---
    const fontPath = '/font/THSarabun.ttf'; // ตรวจสอบ path ให้ถูกต้อง
    const fontUrl = new URL(fontPath, request.url).href;

    const fontBytes = await fetch(fontUrl).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch font from ${fontUrl}: ${res.statusText}`);
      return res.arrayBuffer();
    });

    const thaiFont = await pdfDoc.embedFont(fontBytes);

    // --- 3. เขียนข้อความด้วยตำแหน่ง ---
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];  // สมมุติใช้หน้าแรก

    // กำหนดตำแหน่งและขนาดฟอนต์ที่ต้องการ (ปรับ x,y ตามตำแหน่งบนหน้า PDF ของคุณ)
    const fontSize = 16;
    const textColor = rgb(0, 0, 0); // สีดำ

    // ตัวอย่างตำแหน่ง (x,y) ต้องวัดจาก PDF Template ของคุณเอง
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
      maxWidth: 500, // ถ้าต้องการให้ข้อความไม่ล้นขอบ
      lineHeight: 14,
    });

    // --- 4. Save PDF ---
    const pdfBytes = await pdfDoc.save();

    // --- 5. Upload PDF to Supabase Storage ---
    const sanitizedProjectName = projectName
      .replace(/\s+/g, '_')
      .replace(/[^\x00-\x7F]/g, '');

    const safeName = sanitizedProjectName || 'document';

    const uniqueFileName = `${safeName}_${uuidv4()}.pdf`;
    const bucketName = 'files';

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(uniqueFileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({
        error: `ไม่สามารถอัปโหลดไฟล์ PDF ได้: ${uploadError.message}`,
      }, { status: 500 });
    }

    // --- 6. Generate Public URL ---
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${uniqueFileName}`;

    return NextResponse.json({
      message: 'สร้างเอกสาร PDF สำเร็จ',
      pdfUrl: publicUrl,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in fill-pdf-template API:', error);

    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch font')) {
        return NextResponse.json({ error: `ไม่สามารถโหลดไฟล์ฟอนต์: ${error.message}` }, { status: 500 });
      }
      if (error.message.includes('Failed to fetch PDF template')) {
        return NextResponse.json({ error: `ไม่สามารถโหลด PDF Template: ${error.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างเอกสาร PDF' }, { status: 500 });
  }
}
