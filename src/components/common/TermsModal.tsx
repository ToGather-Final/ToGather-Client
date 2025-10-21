"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MainButton from "./MainButton";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function TermsModal({ isOpen, onClose, title, children }: TermsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-[calc(100vw-48px)] max-w-sm max-h-[60vh] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[40vh] overflow-y-auto px-1 py-1">
          {children}
        </div>
        <MainButton onClick={onClose} className="max-w-[200px] mx-auto">
          확인
        </MainButton>
      </DialogContent>
    </Dialog>
  );
}
