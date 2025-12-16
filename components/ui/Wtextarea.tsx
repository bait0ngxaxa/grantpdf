import * as React from "react";
import {
    ChangeEvent,
    ForwardedRef,
    TextareaHTMLAttributes,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";

type Align = "left" | "center" | "right" | "justify";

interface WordLikeTextareaProps
    extends Omit<
        TextareaHTMLAttributes<HTMLTextAreaElement>,
        "onChange" | "name"
    > {
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;

    wordLikeWidth?: boolean;
    fontSize?: string;
    textAlign?: Align;
    thaiDistributed?: boolean;
    autoResize?: boolean;
    minHeight?: string;
    resizable?: boolean;

    /** ใหม่: กำหนดจำนวนบรรทัดว่างท้ายที่ "ต้องการคงไว้" (เช่น 0, 1, 2) */
    trailingBlankLines?: number; // default 0
}

/* ---------- ยูทิลเล็กๆ ---------- */
// ลบ \r\n ท้ายให้หมดก่อน แล้วเติม \n ตามจำนวนที่ต้องการคงไว้
const ensureTrailingNewlines = (s: string, n: number) => {
    const withoutTrailingNewlines = s.replace(/[\r\n]+$/g, ""); // ไม่ยุ่งกับช่องว่าง/สเปซท้าย
    return withoutTrailingNewlines + (n > 0 ? "\n".repeat(n) : "");
};

function WordLikeTextareaImpl(
    {
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
        thaiDistributed = true,
        id,
        "aria-label": ariaLabel,
        maxLength = 1500,
        required = true,
        disabled = false,
        trailingBlankLines = 0, // ← ค่าเริ่มต้น: ไม่เว้นบรรทัดท้าย
        ...rest
    }: WordLikeTextareaProps,
    ref: ForwardedRef<HTMLTextAreaElement>
) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = useCallback(
        (el: HTMLTextAreaElement) => {
            innerRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref)
                (
                    ref as React.MutableRefObject<HTMLTextAreaElement | null>
                ).current = el;
        },
        [ref]
    );

    const adjustHeight = useCallback(() => {
        if (autoResize && innerRef.current) {
            const el = innerRef.current;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [autoResize]);

    useLayoutEffect(() => {
        adjustHeight();
    }, [value, autoResize, adjustHeight]);

    const emitChange = (next: string) => {
        onChange({
            target: { name, value: next },
        } as unknown as ChangeEvent<HTMLTextAreaElement>);
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e);
        if (autoResize) adjustHeight();
    };

    // ✅ ปล่อยให้ paste ตามปกติ แล้ว “หลังจากแปะเสร็จ 1 เฟรม” ค่อย normalize ท้ายข้อความ
    const handlePaste = (_e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (trailingBlankLines == null) return;
        requestAnimationFrame(() => {
            const el = innerRef.current!;
            const cleaned = ensureTrailingNewlines(
                el.value,
                trailingBlankLines
            );
            if (cleaned !== el.value) {
                emitChange(cleaned);
                if (autoResize) adjustHeight();
            }
        });
    };

    // ✅ ตอน blur ก็ normalize อีกชั้น เพื่อความชัวร์
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (trailingBlankLines == null) return;
        const cleaned = ensureTrailingNewlines(
            e.currentTarget.value,
            trailingBlankLines
        );
        if (cleaned !== e.currentTarget.value) {
            emitChange(cleaned);
        }
    };

    const containerClass = useMemo(
        () => (wordLikeWidth ? "mx-auto" : ""),
        [wordLikeWidth]
    );

    const textAlignClass = useMemo(() => {
        switch (textAlign) {
            case "left":
                return "text-left";
            case "center":
                return "text-center";
            case "right":
                return "text-right";
            case "justify":
            default:
                return "text-justify";
        }
    }, [textAlign]);

    const textareaStyle = useMemo<React.CSSProperties>(() => {
        const style: React.CSSProperties = {
            fontFamily: `'TH Sarabun New', Arial, sans-serif`,
            fontSize,
            lineHeight: 1.6,
            minHeight,
            maxHeight: autoResize ? "none" : "400px",
            hyphens: "auto",
            wordBreak: "normal",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
            textAlign: textAlign as React.CSSProperties["textAlign"],
            ...(autoResize ? { overflow: "hidden" } : {}),
            ...(thaiDistributed && textAlign === "justify"
                ? ({ textJustify: "inter-character" } as Record<string, string>)
                : {}),
            width: "100%",
            boxSizing: "border-box",
            paddingLeft: wordLikeWidth ? "2.2cm" : "12px",
            paddingRight: wordLikeWidth ? "2.2cm" : "12px",
            paddingTop: "12px",
            paddingBottom: "12px",
        };
        return style;
    }, [
        autoResize,
        fontSize,
        minHeight,
        textAlign,
        thaiDistributed,
        wordLikeWidth,
    ]);

    const wrapperStyle = useMemo<React.CSSProperties>(() => {
        if (!wordLikeWidth) return {};
        return { width: "21cm", maxWidth: "21cm" };
    }, [wordLikeWidth]);

    return (
        <div className={containerClass} style={wrapperStyle}>
            <textarea
                ref={setRefs}
                id={id ?? name}
                name={name}
                value={value}
                onChange={handleChange}
                onInput={autoResize ? adjustHeight : undefined}
                onPaste={handlePaste} // ← เพิ่ม
                onBlur={handleBlur} // ← เพิ่ม
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                required={required}
                disabled={disabled}
                className={[
                    "w-full",
                    "leading-relaxed",
                    "border-2 border-gray-300",
                    "bg-white",
                    "rounded-none",
                    "focus:border-blue-500 focus:outline-none focus:ring-0",
                    resizable && !autoResize ? "resize-y" : "resize-none",
                    "shadow-sm",
                    "transition-all duration-200",
                    "print:border-none print:shadow-none",
                    textAlignClass,
                    thaiDistributed && textAlign === "justify"
                        ? "thai-distributed"
                        : "",
                    className,
                ].join(" ")}
                style={textareaStyle}
                aria-label={ariaLabel ?? (id ? undefined : name)}
                {...rest}
            />
        </div>
    );
}

const WordLikeTextarea = React.forwardRef<
    HTMLTextAreaElement,
    WordLikeTextareaProps
>(WordLikeTextareaImpl);
WordLikeTextarea.displayName = "WordLikeTextarea";

export { WordLikeTextarea };
