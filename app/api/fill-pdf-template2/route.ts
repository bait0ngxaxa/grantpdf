import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { projectName, clientName, description } = await request.json();

    // --- 1. Load PDF Template ---
    const templatePath = '/testpdf2.pdf'; // Adjust this to match your actual public path
    const templateUrl = new URL(templatePath, request.url).href;

    const formPdfBytes = await fetch(templateUrl).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch PDF template from ${templateUrl}: ${res.statusText}`);
      return res.arrayBuffer();
    });

    const pdfDoc = await PDFDocument.load(formPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    // --- 2. Load & Embed Thai Font ---
    const fontPath = '/font/NotoSansThai-Regular.ttf'; // Make sure this path is correct and the file exists
    const fontUrl = new URL(fontPath, request.url).href;

    const fontBytes = await fetch(fontUrl).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch font from ${fontUrl}: ${res.statusText}`);
      return res.arrayBuffer();
    });

    const thaiFont = await pdfDoc.embedFont(fontBytes);

    // --- 3. Fill Form Fields ---
    const form = pdfDoc.getForm();

    try {
      const projectNameField = form.getTextField('name');    // PDF field name must match
      const clientNameField = form.getTextField('email');
      const descriptionField = form.getTextField('descrip');

      projectNameField.setText(projectName);
      clientNameField.setText(clientName);
      descriptionField.setText(description);

      // ✅ Important: Call this AFTER setting the text
      form.updateFieldAppearances(thaiFont);

    } catch (fieldError) {
      console.error('Field name error or font embedding issue:', fieldError);
      return NextResponse.json({
        error: 'ชื่อฟิลด์ใน PDF ไม่ถูกต้อง หรือไม่สามารถตั้งค่าฟอนต์ได้',
      }, { status: 400 });
    }

    // --- 4. Save PDF ---
    const pdfBytes = await pdfDoc.save();

    // --- 5. Upload PDF to Supabase Storage ---
    // แก้ไขชื่อไฟล์ให้รองรับ Supabase (ลบตัวอักษรไม่ใช่ ASCII)
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
