"use client";

import { useEffect, useSyncExternalStore } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import { TextStyle } from "@tiptap/extension-text-style/text-style";
import type { Editor } from "@tiptap/core";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    List,
    ListOrdered,
    Redo2,
    Table2,
    Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextNode = {
    type?: string;
    attrs?: Record<string, unknown>;
    content?: RichTextNode[];
    marks?: RichTextNode[];
    text?: string;
};

const FONT_SIZE_OPTIONS = [
    { label: "12", value: "12px" },
    { label: "14", value: "14px" },
    { label: "16", value: "16px" },
    { label: "18", value: "18px" },
    { label: "20", value: "20px" },
    { label: "24", value: "24px" },
    { label: "28", value: "28px" },
    { label: "32", value: "32px" },
] as const;

const DEFAULT_FONT_SIZE = "16px";

const subscribeToClientSnapshot = (onStoreChange: () => void): (() => void) => {
    queueMicrotask(onStoreChange);
    return () => {};
};
const getClientSnapshot = (): boolean => true;
const getServerSnapshot = (): boolean => false;

const useIsHydrated = (): boolean =>
    useSyncExternalStore(
        subscribeToClientSnapshot,
        getClientSnapshot,
        getServerSnapshot,
    );

interface RichTextFieldProps {
    label: string;
    name: string;
    value: string;
    onValueChange: (name: string, value: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    maxLength?: number;
    className?: string;
    toolbarVariant?: "full" | "compact";
    labelClassName?: string;
}

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const textToHtml = (value: string): string => {
    const lines = value.split(/\r?\n/);
    const paragraphs = lines.length > 0 ? lines : [""];

    return paragraphs
        .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
        .join("");
};

const inlineText = (nodes: RichTextNode[] = []): string =>
    nodes
        .map((node) => {
            if (node.type === "text") {
                return node.text || "";
            }

            if (node.type === "hardBreak") {
                return "\n";
            }

            return inlineText(node.content);
        })
        .join("");

const listItemText = (node: RichTextNode): string =>
    (node.content || [])
        .map((child) =>
            child.type === "paragraph"
                ? inlineText(child.content)
                : contentToPlainText(child),
        )
        .filter(Boolean)
        .join("\n");

const tableText = (node: RichTextNode): string =>
    (node.content || [])
        .map((row) =>
            (row.content || [])
                .map((cell) =>
                    (cell.content || [])
                        .map((child) => contentToPlainText(child))
                        .filter(Boolean)
                        .join(" "),
                )
                .join("\t"),
        )
        .join("\n");

const applyFontSize = (editor: Editor, fontSize: string): void => {
    if (!fontSize) {
        editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
        return;
    }

    editor.chain().focus().setMark("textStyle", { fontSize }).run();
};

const sanitizePastedHtml = (html: string): string => {
    const document = new DOMParser().parseFromString(html, "text/html");
    const styledElements = document.body.querySelectorAll<HTMLElement>("[style]");
    const fontElements = document.body.querySelectorAll("font");

    styledElements.forEach((element) => {
        element.style.removeProperty("font-size");
        element.style.removeProperty("line-height");

        if (!element.getAttribute("style")) {
            element.removeAttribute("style");
        }
    });

    fontElements.forEach((element) => {
        element.removeAttribute("size");
    });

    return document.body.innerHTML;
};

const contentToPlainText = (node: RichTextNode, index = 0): string => {
    switch (node.type) {
        case "doc":
            return (node.content || [])
                .map((child) => contentToPlainText(child))
                .filter(Boolean)
                .join("\n");
        case "paragraph":
            return inlineText(node.content).trimEnd();
        case "bulletList":
            return (node.content || [])
                .map((child) => `- ${listItemText(child)}`)
                .join("\n");
        case "orderedList":
            return (node.content || [])
                .map(
                    (child, childIndex) =>
                        `${index + childIndex + 1}. ${listItemText(child)}`,
                )
                .join("\n");
        case "table":
            return tableText(node);
        default:
            return inlineText(node.content);
    }
};

interface ToolbarButtonProps {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

interface FontSizeSelectProps {
    editor: Editor | null;
}

function ToolbarButton({
    label,
    active = false,
    disabled = false,
    onClick,
    children,
}: ToolbarButtonProps): React.JSX.Element {
    return (
        <Button
            type="button"
            variant={active ? "default" : "ghost"}
            size="icon"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
            className="size-8"
        >
            {children}
        </Button>
    );
}

function FontSizeSelect({ editor }: FontSizeSelectProps): React.JSX.Element {
    const textStyleAttrs = editor?.getAttributes("textStyle") as
        | { fontSize?: unknown }
        | undefined;
    const fontSize =
        typeof textStyleAttrs?.fontSize === "string" ? textStyleAttrs.fontSize : "";
    const currentValue = FONT_SIZE_OPTIONS.some(
        (option) => option.value === fontSize,
    )
        ? fontSize
        : DEFAULT_FONT_SIZE;

    return (
        <select
            aria-label="ขนาดตัวอักษร"
            title="ขนาดตัวอักษร"
            disabled={!editor}
            value={currentValue}
            onChange={(event) => {
                const nextFontSize = event.target.value;

                if (!editor) {
                    return;
                }

                applyFontSize(editor, nextFontSize);
            }}
            className="h-8 w-[74px] rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition-colors hover:border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-600 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
        >
            {FONT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

export function RichTextField({
    label,
    name,
    value,
    onValueChange,
    placeholder,
    required = false,
    error,
    maxLength,
    className,
    toolbarVariant = "full",
    labelClassName,
}: RichTextFieldProps): React.JSX.Element {
    const isHydrated = useIsHydrated();
    const hasError = !!error;
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            FontSize,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({ placeholder: placeholder || "" }),
        ],
        content: textToHtml(value),
        immediatelyRender: false,
        editorProps: {
            attributes: {
                "aria-label": label,
                class: "min-h-full px-4 py-3 focus:outline-none",
            },
            transformPastedHTML: sanitizePastedHtml,
        },
        onUpdate: ({ editor: currentEditor }) => {
            const nextValue = contentToPlainText(
                currentEditor.getJSON() as RichTextNode,
            );
            onValueChange(name, nextValue);
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const currentValue = contentToPlainText(editor.getJSON() as RichTextNode);
        if (currentValue !== value) {
            editor.commands.setContent(textToHtml(value), { emitUpdate: false });
        }
    }, [editor, value]);

    const shouldShowCounter = typeof maxLength === "number";
    const isCompactToolbar = toolbarVariant === "compact";
    const shouldShowTableTools = toolbarVariant === "full";
    const shouldShowTextAlignTools = toolbarVariant === "full";
    const activeEditor = isHydrated ? editor : null;

    return (
        <div className="group">
            <label
                className={cn(
                    "mb-2 ml-1 block text-sm font-semibold text-slate-700 transition-colors group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400",
                    labelClassName,
                )}
            >
                {label} {required ? <span className="text-red-500">*</span> : null}
            </label>
            <div
                className={cn(
                    "flex min-h-[220px] flex-col overflow-hidden rounded-xl border bg-white transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200 dark:bg-slate-800",
                    hasError
                        ? "border-red-400 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-100 dark:focus-within:ring-red-900/30"
                        : "border-slate-200 hover:border-blue-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 dark:border-slate-700 dark:hover:border-blue-600 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-900/30",
                    className,
                )}
            >
                <div
                    className={cn(
                        "shrink-0 flex items-center gap-1 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50",
                        isCompactToolbar
                            ? "flex-nowrap overflow-x-auto px-1.5 py-1.5"
                            : "flex-wrap px-2 py-2",
                    )}
                >
                    <ToolbarButton
                        label="ตัวหนา"
                        active={activeEditor?.isActive("bold")}
                        disabled={!activeEditor}
                        onClick={() => activeEditor?.chain().focus().toggleBold().run()}
                    >
                        <Bold className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        label="ตัวเอียง"
                        active={activeEditor?.isActive("italic")}
                        disabled={!activeEditor}
                        onClick={() => activeEditor?.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="size-4" />
                    </ToolbarButton>
                    <FontSizeSelect editor={activeEditor} />
                    <ToolbarButton
                        label="รายการหัวข้อย่อย"
                        active={activeEditor?.isActive("bulletList")}
                        disabled={!activeEditor}
                        onClick={() =>
                            activeEditor?.chain().focus().toggleBulletList().run()
                        }
                    >
                        <List className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        label="รายการลำดับเลข"
                        active={activeEditor?.isActive("orderedList")}
                        disabled={!activeEditor}
                        onClick={() =>
                            activeEditor?.chain().focus().toggleOrderedList().run()
                        }
                    >
                        <ListOrdered className="size-4" />
                    </ToolbarButton>
                    {shouldShowTextAlignTools && (
                        <>
                            <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />
                            <ToolbarButton
                                label="จัดชิดซ้าย"
                                active={activeEditor?.isActive({ textAlign: "left" })}
                                disabled={!activeEditor}
                                onClick={() =>
                                    activeEditor
                                        ?.chain()
                                        .focus()
                                        .setTextAlign("left")
                                        .run()
                                }
                            >
                                <AlignLeft className="size-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                label="จัดกึ่งกลาง"
                                active={activeEditor?.isActive({
                                    textAlign: "center",
                                })}
                                disabled={!activeEditor}
                                onClick={() =>
                                    activeEditor
                                        ?.chain()
                                        .focus()
                                        .setTextAlign("center")
                                        .run()
                                }
                            >
                                <AlignCenter className="size-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                label="จัดชิดขวา"
                                active={activeEditor?.isActive({ textAlign: "right" })}
                                disabled={!activeEditor}
                                onClick={() =>
                                    activeEditor
                                        ?.chain()
                                        .focus()
                                        .setTextAlign("right")
                                        .run()
                                }
                            >
                                <AlignRight className="size-4" />
                            </ToolbarButton>
                            <ToolbarButton
                                label="จัดเต็มบรรทัด"
                                active={activeEditor?.isActive({
                                    textAlign: "justify",
                                })}
                                disabled={!activeEditor}
                                onClick={() =>
                                    activeEditor
                                        ?.chain()
                                        .focus()
                                        .setTextAlign("justify")
                                        .run()
                                }
                            >
                                <AlignJustify className="size-4" />
                            </ToolbarButton>
                        </>
                    )}
                    {shouldShowTableTools && (
                        <ToolbarButton
                            label="แทรกตาราง"
                            disabled={!activeEditor}
                            onClick={() =>
                                activeEditor
                                    ?.chain()
                                    .focus()
                                    .insertTable({
                                        rows: 2,
                                        cols: 2,
                                        withHeaderRow: false,
                                    })
                                    .run()
                            }
                        >
                            <Table2 className="size-4" />
                        </ToolbarButton>
                    )}
                    <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />
                    <ToolbarButton
                        label="ย้อนกลับ"
                        disabled={!activeEditor}
                        onClick={() => activeEditor?.chain().focus().undo().run()}
                    >
                        <Undo2 className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        label="ทำซ้ำ"
                        disabled={!activeEditor}
                        onClick={() => activeEditor?.chain().focus().redo().run()}
                    >
                        <Redo2 className="size-4" />
                    </ToolbarButton>
                </div>
                <div
                    className="document-rich-editor min-h-0 flex-1 overflow-y-auto text-slate-800 dark:text-slate-100"
                    data-placeholder={placeholder}
                >
                    <EditorContent editor={activeEditor} />
                </div>
            </div>
            {shouldShowCounter && (
                <p className="mt-1 ml-1 text-right text-xs text-slate-500 dark:text-slate-400">
                    {value.length}/{maxLength}
                </p>
            )}
            {error && (
                <p className="mt-1 ml-1 text-sm text-red-500 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
