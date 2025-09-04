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

function Textarea({ className, style, ...props }: React.ComponentProps<"textarea">) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // ตรวจสอบความสูงของเนื้อหา
    if (textareaRef.current) {
      const maxHeight = CONTENT_HEIGHT_PX
      if (textareaRef.current.scrollHeight > maxHeight) {
        // ถ้าเกินความสูงของหน้ากระดาษ A4 ให้ตัดข้อความออก
        const text = e.target.value
        e.target.value = text.substring(0, text.length - 1)
        return
      }
    }

    // เรียก onChange ของ parent component
    if (props.onChange) {
      props.onChange(e)
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
        ...style
      }}
      onChange={handleInput}
      {...props}
    />
  )
}

export { Textarea }
