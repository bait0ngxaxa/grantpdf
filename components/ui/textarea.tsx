import * as React from "react"

import { cn } from "@/lib/utils"

// คำนวณขนาดที่พิมพ์ได้ในหน้ากระดาษ A4
const A4_HEIGHT_CM = 29.7
const A4_WIDTH_CM = 21
const MARGIN_TOP_CM = 2.2
const MARGIN_BOTTOM_CM = 2
const MARGIN_LEFT_RIGHT_CM = 2.2
const CM_TO_PX = 37.8
const CONTENT_HEIGHT_PX = (A4_HEIGHT_CM - MARGIN_TOP_CM - MARGIN_BOTTOM_CM) * CM_TO_PX
const CONTENT_WIDTH_PX = (A4_WIDTH_CM - MARGIN_LEFT_RIGHT_CM * 2) * CM_TO_PX

// ฟังก์ชันเตรียม Thai text ก่อนส่งข้อมูล
const prepareThaiText = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  return text
    // ลบ invisible characters ที่อาจทำให้ Thai Distributed ทำงานผิด
    .replace(/[\u200B-\u200D\uFEFF]/g, '')  // Zero-width chars + BOM
    .replace(/\u00AD/g, '')                 // Soft hyphen (สำคัญมาก!)
    .replace(/[\u034F\u061C]/g, '')         // Combining grapheme joiner + Arabic letter mark
    
    // แปลง special spaces เป็น normal space
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    
    // รวม Thai combining characters
    .normalize('NFC')
    
    // จัดการ spaces สำหรับ Thai text
    .replace(/[ \t]{2,}/g, ' ')            // Multiple spaces → single space
    .replace(/^[ \t]+|[ \t]+$/gm, '')      // ลบ leading/trailing spaces ในแต่ละบรรทัด
    
    // ลบ Word field codes และ formatting marks
    .replace(/[\u0013-\u0015]/g, '')       // Field separators
    .replace(/[\u200E\u200F\u202A-\u202E]/g, '') // Directional marks
    
    // จัดการ Thai-specific issues
    .replace(/([\u0e01-\u0e4f])\s+([\u0e01-\u0e4f])/g, '$1 $2') // รักษาช่องว่างระหว่างคำไทย
    .replace(/\s*([.,:;!?])\s*/g, '$1 ')   // จัดการเครื่องหมายวรรคตอน
    
    .trim();
};

// ฟังก์ชันตรวจสอบว่าต้องการ preprocessing หรือไม่
const needsThaiPreprocessing = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  // ตรวจหา problematic characters
  const hasProblematicChars = /[\u200B-\u200D\uFEFF\u00AD\u034F\u061C]/g.test(text);
  const hasSpecialSpaces = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g.test(text);
  const hasMultipleSpaces = /[ \t]{2,}/g.test(text);
  const hasFieldCodes = /[\u0013-\u0015]/g.test(text);
  
  return hasProblematicChars || hasSpecialSpaces || hasMultipleSpaces || hasFieldCodes;
};

function Textarea({ className, style, ...props }: React.ComponentProps<"textarea">) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let processedValue = e.target.value;
    
    // **ประมวลผล Thai text ก่อนตรวจสอบความสูง**
    if (needsThaiPreprocessing(processedValue)) {
      processedValue = prepareThaiText(processedValue);
      
      // อัพเดต textarea value ด้วยค่าที่ประมวลผลแล้ว
      if (e.target.value !== processedValue) {
        e.target.value = processedValue;
        
        // เก็บ cursor position ไว้ที่ตำแหน่งเดิม
        const cursorPos = e.target.selectionStart;
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(cursorPos, cursorPos);
          }
        }, 0);
      }
    }
    
    // ตรวจสอบความสูงของเนื้อหา
    if (textareaRef.current) {
      const maxHeight = CONTENT_HEIGHT_PX
      if (textareaRef.current.scrollHeight > maxHeight) {
        // ถ้าเกินความสูงของหน้ากระดาษ A4 ให้ตัดข้อความออก
        const text = processedValue
        e.target.value = text.substring(0, text.length - 1)
        return
      }
    }

    // เรียก onChange ของ parent component ด้วยค่าที่ประมวลผลแล้ว
    if (props.onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: processedValue
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      props.onChange(syntheticEvent)
    }
  }

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      style={{
        maxWidth: `${CONTENT_WIDTH_PX}px`,
        maxHeight: `${CONTENT_HEIGHT_PX}px`,
        fontFamily: "'TH Sarabun New', Arial, sans-serif",
        fontSize: "22px",
        lineHeight: "1.6",
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
        hyphens: "auto",
        // **เพิ่ม CSS properties สำหรับ Thai text**
        textAlign: "justify" as const,           // สำคัญสำหรับ Thai Distributed
        wordBreak: "break-word" as const,        // การตัดคำที่เหมาะสม
        direction: "ltr" as const,               // กำหนดทิศทางการอ่าน
        unicodeBidi: "normal" as const,          // การจัดการ bidirectional text
        ...style
      }}
      onChange={handleInput}
      // **เพิ่ม placeholder แนะนำสำหรับ Thai text**
      placeholder={props.placeholder || "กรุณาพิมพ์ข้อความภาษาไทย..."}      
      {...props}
    />
  )
}

export { Textarea }
