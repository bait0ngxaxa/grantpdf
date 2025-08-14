import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to generate a unique filename
const generateUniqueFilename = (originalName: string): string => {
  const sanitizedName = originalName.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
  const timestamp = Date.now();
  return `${timestamp}_${sanitizedName}`;
};

export async function POST(req: Request) {
  try {
    // ✅ Get session from NextAuth
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // แปลง user.id เป็น bigint เพื่อใช้กับ Prisma
    const userId = BigInt(session.user.id);

    // 1. Get the form data from the request body
    const formData = await req.formData();
    const head = formData.get("head") as string;
    const fileName = formData.get("fileName") as string;
    const date = formData.get("date") as string;
    const topicdetail = formData.get("topicdetail") as string;
    const todetail = formData.get("todetail") as string;
    const attachmentdetail = formData.get("attachmentdetail") as string;
    const detail = formData.get("detail") as string;
    const name = formData.get("name") as string;
    const depart = formData.get("depart") as string;
    const coor = formData.get("coor") as string;
    const tel = formData.get("tel") as string;
    const email = formData.get("email") as string;
    const signatureFile = formData.get("signatureFile") as File | null;
    const fixedAttachment = formData.get("attachment") as string;
    const fixedRegard = formData.get("regard") as string;

    if (!signatureFile) {
      return new NextResponse("Signature file is missing.", { status: 400 });
    }

    // 2. Read the signature image file into a buffer
    const signatureArrayBuffer = await signatureFile.arrayBuffer();
    const signatureImageBuffer = Buffer.from(signatureArrayBuffer);

    // 3. Read the Word template file
    const templatePath = path.join(process.cwd(), "public", "blank_header.docx");
    const content = await fs.readFile(templatePath);

    // 4. Initialize Docxtemplater
    const zip = new PizZip(content);
    const imageModule = new ImageModule({
      getImage: (tag: string) => {
        if (tag === "signature") {
          return signatureImageBuffer;
        }
        return null;
      },
      getSize: () => [150, 80],
      centered: false,
    });
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    });

    // 5. Render data into the template
    doc.render({
      head,
      date,
      topicdetail,
      todetail,
      attachment: fixedAttachment,
      attachmentdetail,
      detail,
      regard: fixedRegard,
      name,
      depart,
      coor,
      tel,
      email,
      signature: "signature",
    });

    // 6. Generate Word buffer with proper encoding
    const outputBuffer = doc.getZip().generate({
      type: "uint8array",
      compression: "DEFLATE",
    });

    // 7. Upload file to Supabase
    const uniqueFileName = generateUniqueFilename(fileName + ".docx");
    const storageBucket = "files";

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(storageBucket)
      .upload(uniqueFileName, outputBuffer, {
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return new NextResponse(`เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ${uploadError.message}`, { status: 500 });
    }

    // Get public URL
    const { data: fileUrlData } = supabaseAdmin.storage
      .from(storageBucket)
      .getPublicUrl(uploadData.path);
    const publicUrl = fileUrlData.publicUrl;

    // 8. Save file info to Prisma
    await prisma.userFile.create({
      data: {
        originalFileName: fileName + ".docx",
        storagePath: publicUrl,
        fileExtension: "docx",
        userId: userId,
      },
    });

    // 9. Return generated Word file
    // ✅ แก้ไข: ใช้ Uint8Array และ Response
    return new Response(outputBuffer.buffer as any, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}.docx"`,
      },
    });

  } catch (error) {
    console.error("Error generating or saving document:", error);
    let errorMessage = "Internal Server Error";
    if (error && typeof error === "object" && "properties" in error) {
      errorMessage =
        "Docxtemplater template error. Please check your template file placeholders.";
    }
    return new NextResponse(errorMessage, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}