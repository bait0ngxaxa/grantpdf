import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PreviewModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  previewUrl: string;
  previewTitle: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  previewUrl,
  previewTitle,
}) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-5xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>{previewTitle}</DialogTitle>
        </DialogHeader>
        <iframe
          src={previewUrl}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </DialogContent>
    </Dialog>
  );
};