// /app/api/create-tors-pdf/route.ts (ปรับปรุงจากโค้ดเดิม)
import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { supabaseAdmin } from '@/lib/supabase'; // FIX: Import supabaseAdmin client

export async function POST(request: Request) {
  try {
    const {
      projectName,
      clientName,
      projectDescription,
      scopeOfWork,
      startDate,
      endDate,
      budget,
      contactPerson,
    } = await request.json();

    // 1. Generate PDF Bytes (from your existing pdf-lib logic)
    const formUrl = 'https://pdf-lib.js.org/assets/form_example.pdf';
    const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();

    form.getTextField('Name').setText(projectName);
    form.getTextField('Client').setText(clientName);
    form.getTextField('Description').setText(projectDescription);
    form.getTextField('Scope').setText(scopeOfWork);
    form.getTextField('StartDate').setText(startDate);
    form.getTextField('EndDate').setText(endDate);
    form.getTextField('Budget').setText(budget.toString());
    form.getTextField('ContactPerson').setText(contactPerson);

    const pdfBytes = await pdfDoc.save(); // This is your generated PDF file in bytes

    // 2. Upload PDF to Supabase Storage
    const fileName = `${projectName.replace(/\s/g, '_')}_${Date.now()}.pdf`; // Generate a unique file name
    const bucketName = 'files'; // FIX: Replace with your actual bucket name

    // Use supabaseAdmin for server-side upload, as it bypasses RLS
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false, // Set to true if you want to overwrite existing files with the same name
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload PDF to storage' }, { status: 500 });
    }

    // 3. Get the public URL of the uploaded file
    // If your bucket is public, the URL is straightforward.
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
    
    // In a real app, you would save this publicUrl to your database (e.g., Prisma)
    // await prisma.torsDocument.create({ data: { projectName, clientName, pdfUrl: publicUrl, ... } });
    console.log('PDF uploaded to Supabase:', publicUrl);

    return NextResponse.json({ message: 'PDF created and uploaded successfully', pdfUrl: publicUrl }, { status: 200 });

  } catch (error) {
    console.error('Error creating or uploading PDF:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างหรืออัปโหลด PDF' }, { status: 500 });
  }
}