import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';

export async function POST(req: Request) {
  try {
    // 1. Get the form data from the request body
    const formData = await req.formData();
    const head = formData.get('head') as string;
    const topic = formData.get('topic') as string;
    const signatureFile = formData.get('signatureFile') as File | null;

    if (!signatureFile) {
      return new NextResponse('Signature file is missing.', { status: 400 });
    }

    // 2. Read the signature image file into a buffer
    const signatureArrayBuffer = await signatureFile.arrayBuffer();
    const signatureImageBuffer = Buffer.from(signatureArrayBuffer);

    // 3. Read the Word template file from the public directory
    const templatePath = path.join(process.cwd(), 'public', 'blank_header.docx');
    const content = await fs.readFile(templatePath, 'binary');

    // 4. Initialize PizZip with the template content
    const zip = new PizZip(content);
    
    // 5. Create an image module with options
    // The getImage and getSize functions are now correctly passed here.
    const imageModule = new ImageModule({
      // This function tells docxtemplater how to handle the image data for a specific placeholder
      getImage: (tag: string) => {
        if (tag === 'signature') {
          return signatureImageBuffer;
        }
        return null;
      },
      // Set the size for the image here (e.g., width, height)
      getSize: (img: Buffer) => {
        // You can adjust these values as needed
        return [150, 80]; // Width, Height in pixels
      },
      centered: false,
    });
    
    // 6. Initialize Docxtemplater with the image module
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule] // Pass the image module to the Docxtemplater instance
    });

    // 7. Render the data into the template
    // IMPORTANT: Pass the image placeholder tag as a string.
    // The key 'signature' must match the placeholder {signature} in your .docx file.
    doc.render({ 
      head, 
      topic,
      signature: 'signature' // This string must match the tag name in the getImage function
    });
    
    // 8. Generate the output file buffer
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // 9. Return the generated Word file as a response
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="grant_doc.docx"',
      },
    });

  } catch (error) {
    console.error('Error generating Word document with signature:', error);
    
    let errorMessage = 'Internal Server Error';
    if (error && typeof error === 'object' && 'properties' in error) {
      errorMessage = 'Docxtemplater template error. Please check your template file for correctly formatted placeholders (e.g., {head}, {topic}, {signature}).';
    }
    
    return new NextResponse(errorMessage, { status: 500 });
  }
}