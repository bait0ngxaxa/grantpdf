"use client";

import React, {
    useRef,
    useState,
    useImperativeHandle,
    forwardRef,
    useEffect,
} from "react";
import { Button } from "@/components/ui/button";

interface SignatureCanvasComponentProps {
    onSignatureChange?: (signatureDataURL: string | null) => void;
    canvasProps?: {
        width?: number;
        height?: number;
        backgroundColor?: string;
        penColor?: string;
    };
}

export interface SignatureCanvasRef {
    clear: () => void;
    isEmpty: () => boolean;
    getSignatureDataURL: () => string | null;
}

const SignatureCanvasComponent = forwardRef<
    SignatureCanvasRef,
    SignatureCanvasComponentProps
>(({ onSignatureChange, canvasProps = {} }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastX = useRef(0);
    const lastY = useRef(0);
    const [isEmpty, setIsEmpty] = useState(true);
    const hasDrawing = useRef(false);

    const {
        width = 400,
        height = 200,
        backgroundColor = "rgba(255, 255, 255, 1)",
        penColor = "black",
    } = canvasProps;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
    }, [backgroundColor, penColor]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        isDrawing.current = true;

        const rect = canvas.getBoundingClientRect();
        if ("touches" in e) {
            lastX.current = e.touches[0].clientX - rect.left;
            lastY.current = e.touches[0].clientY - rect.top;
        } else {
            lastX.current = e.nativeEvent.clientX - rect.left;
            lastY.current = e.nativeEvent.clientY - rect.top;
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent): void => {
        if (!isDrawing.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let currentX, currentY;

        if ("touches" in e) {
            currentX = e.touches[0].clientX - rect.left;
            currentY = e.touches[0].clientY - rect.top;
        } else {
            currentX = e.nativeEvent.clientX - rect.left;
            currentY = e.nativeEvent.clientY - rect.top;
        }

        ctx.beginPath();
        ctx.moveTo(lastX.current, lastY.current);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        lastX.current = currentX;
        lastY.current = currentY;

        if (!hasDrawing.current) {
            hasDrawing.current = true;
            setIsEmpty(false);
        }
    };

    const stopDrawing = (): void => {
        isDrawing.current = false;

        if (hasDrawing.current && onSignatureChange) {
            setTimeout(() => {
                const canvas = canvasRef.current;
                if (canvas) {
                    onSignatureChange(canvas.toDataURL("image/png"));
                }
            }, 100);
        }
    };

    const clearCanvas = (): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        hasDrawing.current = false;
        setIsEmpty(true);

        if (onSignatureChange) {
            onSignatureChange(null);
        }
    };

    const checkIsEmpty = (): boolean => {
        return !hasDrawing.current;
    };

    const getSignatureDataURL = (): string | null => {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawing.current) return null;
        return canvas.toDataURL("image/png");
    };

    useImperativeHandle(ref, () => ({
        clear: clearCanvas,
        isEmpty: checkIsEmpty,
        getSignatureDataURL: getSignatureDataURL,
    }));

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 bg-gray-50 dark:bg-slate-800/50">
                <div className="flex justify-center">
                    <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                        <canvas
                            ref={canvasRef}
                            width={width}
                            height={height}
                            className="signature-canvas"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            style={{ touchAction: "none", cursor: "crosshair" }}
                        />
                    </div>
                </div>

                <div className="flex justify-center mt-4 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={clearCanvas}
                        disabled={isEmpty}
                        className="px-4 py-2 text-sm"
                    >
                        ลบลายเซ็น
                    </Button>
                </div>

                <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-2">
                    ลากเมาส์หรือนิ้วเพื่อวาดลายเซ็นในกรอบข้างต้น
                </p>
            </div>
        </div>
    );
});

SignatureCanvasComponent.displayName = "SignatureCanvasComponent";

export default SignatureCanvasComponent;
