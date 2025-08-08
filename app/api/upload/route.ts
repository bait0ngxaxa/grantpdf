// /app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase'; // Import the admin client for server-side operations
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names

// Install uuid if you haven't: npm install uuid @types/uuid

export async function POST(req: NextRequest) {
  try {
    // 1. Get the file from the request FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่อัปโหลด' }, { status: 400 });
    }

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Generate a unique file name to avoid collisions
    // You might want to include user ID or a timestamp in a real application
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`; 
    const bucketName = 'files'; 

    // 2. Upload the file to Supabase Storage
    // Use supabaseAdmin for server-side uploads, as it bypasses RLS
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(uniqueFileName, fileBuffer, {
        contentType: file.type, // Use the detected content type of the file
        upsert: false, // Set to true if you want to overwrite files with the same name
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: `ไม่สามารถอัปโหลดไฟล์ได้: ${uploadError.message}` }, { status: 500 });
    }

    // 3. Construct the public URL of the uploaded file
    // Ensure NEXT_PUBLIC_SUPABASE_URL is correctly set in your .env
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${uniqueFileName}`;

    console.log('File uploaded successfully:', publicUrl);
    return NextResponse.json({ message: 'อัปโหลดสำเร็จ', fileUrl: publicUrl }, { status: 200 });

  } catch (error) {
    console.error('Error during file upload:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}