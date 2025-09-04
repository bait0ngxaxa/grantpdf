//ตัดทุกอย่าง ให้เป็น Paragraph ทั้งหมด
const fixThaiDistributed = (text: string): string => {
    if (!text || typeof text !== 'string') return "";
    
    return text
        // 1. ลบ character ที่ทำให้ Thai Distributed ทำงานผิด
        .replace(/[\u200B-\u200D]/g, '')        // Zero-width spaces
        .replace(/[\u2060-\u206F]/g, '')        // Word joiner, invisible characters  
        .replace(/\uFEFF/g, '')                 // Byte order mark
        .replace(/\u00AD/g, '')                 // Soft hyphen (ตัวการสำคัญ!)
        
        // 2. จัดการ Non-breaking space ที่ Word ใส่แฝง
        .replace(/\u00A0/g, ' ')                // Non-breaking space → normal space
        .replace(/[\u2000-\u200A]/g, ' ')       // En quad, Em quad, etc. → normal space
        .replace(/\u202F/g, ' ')                // Narrow no-break space → normal space
        .replace(/\u205F/g, ' ')                // Medium mathematical space → normal space
        .replace(/\u3000/g, ' ')                // Ideographic space → normal space
        
        // 3. จัดการ Thai combining characters ที่แยกออกมา
        .normalize('NFC')                       // รวม combining characters เข้าด้วยกัน
        
        // 4. จัดการ Line breaks และ paragraph marks จาก Word (จุดสำคัญ!)
        .replace(/\r\n/g, '\n')                // Windows line ending
        .replace(/\r/g, '\n')                  // Mac line ending
        .replace(/\u2028/g, '\n')              // Line separator
        .replace(/\u2029/g, '\n\n')            // Paragraph separator
        .replace(/\u000B/g, '\n')              // Vertical tab (จาก Word)
        .replace(/\u000C/g, '\n')              // Form feed (จาก Word)
        
        // 5. ลบ manual line breaks ที่เกิดจาก Shift+Enter ใน Word
        .replace(/\u000A/g, '\n')              // Line feed
        .replace(/\n+/g, '\n')                 // Multiple line breaks → single
        
        // 6. จัดการ spaces - สำคัญมากสำหรับ Thai Distributed!
        .replace(/[ \t]+/g, ' ')               // Multiple spaces → single space
        .replace(/\n[ \t]+/g, '\n')            // Remove leading spaces on new lines
        .replace(/[ \t]+\n/g, '\n')            // Remove trailing spaces before new lines
        
        // 7. จัดการ Word's hidden formatting และ field codes
        .replace(/[\u061C]/g, '')              // Arabic letter mark
        .replace(/[\u200E\u200F]/g, '')        // Left-to-right/Right-to-left mark
        .replace(/[\u202A-\u202E]/g, '')       // Directional formatting
        .replace(/\u001E/g, '')                // Record separator (จาก Word fields)
        .replace(/\u001F/g, '')                // Unit separator (จาก Word fields)
        
        // 8. ลบ Word field codes และ hyperlink remnants
        .replace(/\u0013[^\u0014\u0015]*\u0014([^\u0015]*)\u0015/g, '$1') // Field codes
        .replace(/[\u0013\u0014\u0015]/g, '')  // Field separators
        
        // 9. จัดการ paragraph formatting จาก Word
        .replace(/\n{3,}/g, '\n\n')           // ลบ empty lines เกิน
        .replace(/^\n+/, '')                   // ลบ line breaks ที่จุดเริ่มต้น
        .replace(/\n+$/, '')                   // ลบ line breaks ที่จุดสิ้นสุด
        
        // 10. Clean up edges
        .trim()
        
        // 11. แทนที่ line breaks ที่เหลือด้วย space สำหรับข้อความที่ควรจะอยู่ในบรรทัดเดียว
        .replace(/\n(?!\n)/g, ' ')            // Single line break → space (keep double for paragraphs)
        .replace(/\n\n+/g, '\n\n')            // Multiple paragraph breaks → double
        
        // 12. Final cleanup
        .replace(/\s+/g, ' ')                 // Multiple whitespaces → single space
        .trim();
};

export default fixThaiDistributed;