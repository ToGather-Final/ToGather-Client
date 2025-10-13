"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import MainButton from "./MainButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  text?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, text, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-[calc(100vw-32px)] max-w-[calc(var(--app-max-w)-32px)] rounded-xl ">
        {children}
        <MainButton onClick={onClose} className="max-w-sm">
          {text || "확인"}
        </MainButton>
      </DialogContent>
    </Dialog>
  );
}
