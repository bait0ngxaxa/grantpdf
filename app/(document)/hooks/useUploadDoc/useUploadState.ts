"use client";

import { useState, useRef } from "react";
import { type UploadStateReturn } from "./types";

export function useUploadState(): UploadStateReturn {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);

    return {
        selectedFile,
        setSelectedFile,
        isUploading,
        setIsUploading,
        uploadMessage,
        setUploadMessage,
        uploadSuccess,
        setUploadSuccess,
        fileInputRef,
    };
}
