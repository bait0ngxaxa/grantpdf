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
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "name"> {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;

  /** ทำคอนเทนเนอร์ให้มีขนาดคล้ายหน้ากระดาษ A4 (กว้าง 21cm + margin) */
  wordLikeWidth?: boolean;

  /** ขนาดฟอนต์ เช่น '22px' */
  fontSize?: string;

  /** การจัดแนวข้อความ */
  textAlign?: Align;

  /** พยายามเลียนแบบ Thai Distributed (ต้องใช้ร่วมกับ justify) */
  thaiDistributed?: boolean;

  /** ปรับความสูงอัตโนมัติ */
  autoResize?: boolean;

  /** ความสูงต่ำสุดของกล่องข้อความ */
  minHeight?: string;

  /** ให้สามารถปรับขนาดด้วยเมาส์ (เมื่อไม่ autoResize) */
  resizable?: boolean;
}

function _WordLikeTextarea(
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
    ...rest
  }: WordLikeTextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  // allow both: external ref + internal ref
  const setRefs = useCallback(
    (el: HTMLTextAreaElement) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
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

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    if (autoResize) adjustHeight();
  };

  const containerClass = useMemo(() => {
    if (!wordLikeWidth) return "";
    // เฟรม A4: 21cm ความกว้าง + margin ซ้าย/ขวา
    return "mx-auto";
  }, [wordLikeWidth]);

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
      // auto-resize ไม่ให้เกิด scrollbar กระโดด
      ...(autoResize ? { overflow: "hidden" } : {}),
      // Thai Distributed (best-effort)
      ...(thaiDistributed && textAlign === "justify"
        ? {
            // ทำงานร่วมกับ justify (รองรับบางเบราว์เซอร์)
            // @ts-ignore - type ไม่รู้จักในบางระบบ แต่เบราว์เซอร์เข้าใจ
            textJustify: "inter-character",
          }
        : {}),
      // ให้ textarea กว้าง 100% แล้วไปคุม A4 ที่คอนเทนเนอร์
      width: "100%",
      boxSizing: "border-box",
      // padding ด้านในที่ “รู้สึกเหมือนเอกสาร”
      paddingLeft: wordLikeWidth ? "2.2cm" : undefined,
      paddingRight: wordLikeWidth ? "2.2cm" : undefined,
      paddingTop: "12px",
      paddingBottom: "12px",
    };

    return style;
  }, [autoResize, fontSize, minHeight, textAlign, thaiDistributed, wordLikeWidth]);

  const wrapperStyle = useMemo<React.CSSProperties>(() => {
    if (!wordLikeWidth) return {};
    return {
      width: "21cm",
      maxWidth: "21cm",
    };
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
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        className={[
          // base
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
          // คลาสสำหรับ Thai Distributed (เผื่อไปเติมใน global.css)
          thaiDistributed && textAlign === "justify" ? "thai-distributed" : "",
          className,
        ].join(" ")}
        style={textareaStyle}
        aria-label={ariaLabel ?? (id ? undefined : name)}
        {...rest}
      />
    </div>
  );
}

const WordLikeTextarea = React.forwardRef<HTMLTextAreaElement, WordLikeTextareaProps>(
  _WordLikeTextarea
);
WordLikeTextarea.displayName = "WordLikeTextarea";

export { WordLikeTextarea };
