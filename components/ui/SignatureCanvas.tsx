"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';

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

const SignatureCanvasComponent = forwardRef<SignatureCanvasRef, SignatureCanvasComponentProps>(
  ({ onSignatureChange, canvasProps = {} }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const {
      width = 400,
      height = 200,
      backgroundColor = 'rgba(255, 255, 255, 1)',
      penColor = 'black'
    } = canvasProps;

    // ตรวจสอบว่า component ถูก mount แล้ว
    useEffect(() => {
      setIsMounted(true);
      return () => {
        // Cleanup
        if (sigCanvas.current) {
          sigCanvas.current.clear();
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      clear: () => {
        if (sigCanvas.current) {
          sigCanvas.current.clear();
          setIsEmpty(true);
          onSignatureChange?.(null);
        }
      },
      isEmpty: () => {
        return sigCanvas.current ? sigCanvas.current.isEmpty() : true;
      },
      getSignatureDataURL: () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
          try {
            const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            return dataURL;
          } catch (error) {
            return null;
          }
        }
        return null;
      }
    }));

    const handleSignatureEnd = () => {
      // เพิ่มการตรวจสอบแบบเข้มงวดเพื่อให้แน่ใจว่าทุกอย่างพร้อม
      if (!isMounted || !sigCanvas.current) {
        return;
      }
      
      try {
        const isCanvasEmpty = sigCanvas.current.isEmpty();
        setIsEmpty(isCanvasEmpty);
        
        if (!isCanvasEmpty) {
          // ใช้ setTimeout เพื่อให้แน่ใจว่า canvas ถูกอัปเดตแล้ว
          setTimeout(() => {
            // ตรวจสอบอีกครั้งหลัง timeout
            if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
              try {
                const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
                if (!trimmedCanvas) {
                  onSignatureChange?.(null);
                  return;
                }
                
                const dataURL = trimmedCanvas.toDataURL('image/png', 1.0);
                // ตรวจสอบว่า dataURL ถูกต้อง
                if (!dataURL || dataURL === 'data:,' || !dataURL.startsWith('data:image/png')) {
                  onSignatureChange?.(null);
                  return;
                }
                
                // ส่งค่ากลับเฉพาะเมื่อ dataURL ถูกต้อง
                onSignatureChange?.(dataURL);
              } catch (error) {
                onSignatureChange?.(null);
              }
            }
          }, 200); // เพิ่มเวลาเป็น 200ms
        } else {
          onSignatureChange?.(null);
        }
      } catch (error) {
        onSignatureChange?.(null);
      }
    };

    const clearSignature = () => {
      if (sigCanvas.current) {
        sigCanvas.current.clear();
        setIsEmpty(true);
        onSignatureChange?.(null);
      }
    };

    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-center">
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
              {isMounted ? (
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    width: width,
                    height: height,
                    className: 'signature-canvas'
                  }}
                  backgroundColor={backgroundColor}
                  penColor={penColor}
                  onEnd={handleSignatureEnd}
                  clearOnResize={false}
                />
              ) : (
                <div 
                  className="flex items-center justify-center bg-white border"
                  style={{ width: width, height: height }}
                >
                  <p className="text-gray-500 text-sm">กำลังโหลด...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={clearSignature}
              disabled={isEmpty || !isMounted}
              className="px-4 py-2 text-sm"
            >
              ลบลายเซ็น
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            ลากเมาส์หรือนิ้วเพื่อวาดลายเซ็นในกรอบข้างต้น
          </p>
        </div>
      </div>
    );
  }
);

SignatureCanvasComponent.displayName = 'SignatureCanvasComponent';

export default SignatureCanvasComponent;