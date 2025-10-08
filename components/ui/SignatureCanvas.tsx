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
            console.log('Manual getSignatureDataURL called:', dataURL ? 'Success' : 'Failed');
            return dataURL;
          } catch (error) {
            console.error('Error in getSignatureDataURL:', error);
            return null;
          }
        }
        return null;
      }
    }));

    const handleSignatureEnd = () => {
      if (!isMounted || !sigCanvas.current) {
        console.log('Canvas not ready for signature processing');
        return;
      }
      
      try {
        const isCanvasEmpty = sigCanvas.current.isEmpty();
        setIsEmpty(isCanvasEmpty);
        
        if (!isCanvasEmpty) {
          // ใช้ setTimeout เพื่อให้แน่ใจว่า canvas ถูกอัปเดตแล้ว
          setTimeout(() => {
            if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
              try {
                const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
                if (!trimmedCanvas) {
                  throw new Error('Failed to get trimmed canvas');
                }
                
                const dataURL = trimmedCanvas.toDataURL('image/png', 1.0);
                if (!dataURL || dataURL === 'data:,') {
                  throw new Error('Failed to generate valid dataURL');
                }
                
                console.log('Generated signature dataURL:', dataURL ? 'Success' : 'Failed');
                console.log('DataURL length:', dataURL ? dataURL.length : 0);
                console.log('DataURL starts with:', dataURL ? dataURL.substring(0, 50) : 'null');
                
                onSignatureChange?.(dataURL);
              } catch (error) {
                console.error('Error in delayed signature processing:', error);
                onSignatureChange?.(null);
              }
            }
          }, 150); // เพิ่มเวลาอีกนิด
        } else {
          onSignatureChange?.(null);
        }
      } catch (error) {
        console.error('Error in handleSignatureEnd:', error);
        onSignatureChange?.(null);
      }
    };

    const clearSignature = () => {
      if (sigCanvas.current) {
        sigCanvas.current.clear();
        setIsEmpty(true);
        onSignatureChange?.(null);
        console.log('Signature cleared');
      }
    };

    const testSignature = () => {
      if (sigCanvas.current) {
        const isCanvasEmpty = sigCanvas.current.isEmpty();
        console.log('Test - Canvas empty:', isCanvasEmpty);
        if (!isCanvasEmpty) {
          try {
            const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            console.log('Test - Generated dataURL length:', dataURL.length);
            console.log('Test - DataURL preview:', dataURL.substring(0, 100) + '...');
            onSignatureChange?.(dataURL);
          } catch (error) {
            console.error('Test - Error:', error);
          }
        }
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
            {process.env.NODE_ENV === 'development' && (
              <Button
                type="button"
                variant="outline"
                onClick={testSignature}
                disabled={isEmpty || !isMounted}
                className="px-4 py-2 text-sm bg-yellow-50 border-yellow-300"
              >
                ทดสอบลายเซ็น
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            ลากเมาส์หรือนิ้วเพื่อวาดลายเซ็นในกรอบข้างต้น
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <p>Debug: Mounted: {isMounted ? 'Yes' : 'No'}</p>
              <p>Canvas Empty: {isEmpty ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

SignatureCanvasComponent.displayName = 'SignatureCanvasComponent';

export default SignatureCanvasComponent;