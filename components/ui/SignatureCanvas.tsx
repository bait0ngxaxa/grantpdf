"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
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

    const {
      width = 400,
      height = 200,
      backgroundColor = 'rgba(255, 255, 255, 1)',
      penColor = 'black'
    } = canvasProps;

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
          return sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        }
        return null;
      }
    }));

    const handleSignatureEnd = () => {
      if (sigCanvas.current) {
        const isCanvasEmpty = sigCanvas.current.isEmpty();
        setIsEmpty(isCanvasEmpty);
        
        if (!isCanvasEmpty) {
          const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
          onSignatureChange?.(dataURL);
        } else {
          onSignatureChange?.(null);
        }
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
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={clearSignature}
              disabled={isEmpty}
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