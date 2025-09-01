// สร้าง Component ใหม่สำหรับ Word-like textarea
import * as React from "react";
import { ChangeEvent, useEffect, useRef } from "react";

const WordLikeTextarea = ({ 
    name, 
    value, 
    onChange, 
    placeholder = "",
    className = "",
    rows = 5,
    resizable = true,
    minHeight = "120px",
    autoResize = false,
    wordLikeWidth = false,
    fontSize = "22px",
    textAlign = "justify",
    thaiDistributed = true // เพิ่ม prop สำหรับ Thai distributed
}: {
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    rows?: number;
    resizable?: boolean;
    minHeight?: string;
    autoResize?: boolean;
    wordLikeWidth?: boolean;
    fontSize?: string;
    textAlign?: "left" | "center" | "right" | "justify";
    thaiDistributed?: boolean;
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize function
    const adjustHeight = () => {
        if (autoResize && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value, autoResize]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e);
        if (autoResize) {
            adjustHeight();
        }
    };

    // คำนวณ width สำหรับ A4 format
    const getWidthClass = () => {
        if (wordLikeWidth) {
            return 'w-full max-w-[16.6cm] mx-auto'; // A4 content width (21cm - 4.4cm margin)
        }
        return 'w-full';
    };

    // เพิ่มฟังก์ชันสำหรับ text alignment class
    const getTextAlignClass = () => {
        switch (textAlign) {
            case 'left': return 'text-left';
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            case 'justify': return 'text-justify';
            default: return 'text-justify';
        }
    };

    // สร้าง style object สำหรับ Thai distributed
    const getThaiDistributedStyle = () => {
        if (thaiDistributed && textAlign === 'justify') {
            return {
                textJustify: 'distribute',
                textAlignLast: 'justify',
                wordSpacing: '0.25em',
                letterSpacing: '0.08em',
                // เพิ่ม CSS สำหรับ Thai text rendering
                fontFeatureSettings: '"liga" 1, "kern" 1',
                textRendering: 'optimizeLegibility' as const,
            };
        }
        return {
            textJustify: 'inter-word',
            letterSpacing: '0.5px',
        };
    };

    return (
        <div className={wordLikeWidth ? 'flex justify-center' : ''}>
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={rows}
                className={`
                    ${getWidthClass()}
                    px-[2.2cm] py-3
                    font-['TH_Sarabun_New',_Arial,_sans-serif] text-base leading-relaxed
                    border-2 border-gray-300 
                    rounded-none
                    bg-white
                    focus:border-blue-500 focus:outline-none focus:ring-0
                    ${resizable && !autoResize ? 'resize-y' : 'resize-none'}
                    shadow-sm
                    print:border-none print:shadow-none 
                    transition-all duration-200
                    word-justify
                    ${className}
                `}
                style={{
                    fontFamily: 'TH Sarabun New, Times New Roman, serif',
                    fontSize: fontSize,
                    lineHeight: '1.6',
                    minHeight: minHeight,
                    maxHeight: autoResize ? 'none' : '400px',
                    textAlign: textAlign,
                    textJustify: 'auto', // ให้ browser เลือกวิธีที่เหมาะสม
                    textAlignLast: 'left', // บรรทัดสุดท้ายชิดซ้าย
                    wordSpacing: 'normal', // ระยะห่างคำปกติ
                    letterSpacing: 'normal', // ระยะห่างตัวอักษรปกติ
                    hyphens: 'auto', // เปิดใช้การตัดคำ
                    hyphenateCharacter: '-', // ใช้เครื่องหมายขีดกลางในการตัดคำ
                    wordBreak: 'normal', // การตัดคำปกติ
                    overflowWrap: 'break-word', // ตัดคำเมื่อยาวเกินไป
                    whiteSpace: 'pre-wrap', // รักษาการขึ้นบรรทัดใหม่
                    // A4 specific styling
                    ...(wordLikeWidth && {
                        width: '21cm',
                        maxWidth: '21cm',
                        paddingLeft: '2.2cm',
                        paddingRight: '2.2cm',
                        boxSizing: 'border-box'
                    })
                }}
            />
        </div>
    );
};

export { WordLikeTextarea };

// ใช้ในฟอร์ม
