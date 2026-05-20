"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/core";
import {
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

type RichTextNode = JSONContent & {
    attrs?: Record<string, unknown>;
    content?: RichTextNode[];
    marks?: RichTextNode[];
    text?: string;
};

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
    const hasError = !!error;
    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({ placeholder: placeholder || "" }),
        ],
        content: textToHtml(value),
        immediatelyRender: false,
        editorProps: {
            attributes: {
                "aria-label": label,
                class: "min-h-full px-4 py-3 focus:outline-none",
            },
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
    const shouldShowTableTools = toolbarVariant === "full";

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
                <div className="shrink-0 flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2 dark:border-slate-700 dark:bg-slate-900/50">
                    <ToolbarButton
                        label="ตัวหนา"
                        active={editor?.isActive("bold")}
                        disabled={!editor}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                    >
                        <Bold className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        label="ตัวเอียง"
                        active={editor?.isActive("italic")}
                        disabled={!editor}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        label="รายการหัวข้อย่อย"
                        active={editor?.isActive("bulletList")}
                        disabled={!editor}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    >
                        <List className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        label="รายการลำดับเลข"
                        active={editor?.isActive("orderedList")}
                        disabled={!editor}
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered className="size-4" />
                    </ToolbarButton>
                    {shouldShowTableTools && (
                        <ToolbarButton
                            label="แทรกตาราง"
                            disabled={!editor}
                            onClick={() =>
                                editor
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
                        disabled={!editor}
                        onClick={() => editor?.chain().focus().undo().run()}
                    >
                        <Undo2 className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        label="ทำซ้ำ"
                        disabled={!editor}
                        onClick={() => editor?.chain().focus().redo().run()}
                    >
                        <Redo2 className="size-4" />
                    </ToolbarButton>
                </div>
                <div
                    className="document-rich-editor min-h-0 flex-1 overflow-y-auto text-slate-800 dark:text-slate-100"
                    data-placeholder={placeholder}
                >
                    <EditorContent editor={editor} />
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
