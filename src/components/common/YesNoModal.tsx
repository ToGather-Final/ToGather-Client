"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MainButton from "./MainButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onYes?: () => void;
  text1?: string;
  text2?: string;
  children: React.ReactNode;
}

export default function YesNoModal({
  isOpen,
  onClose,
  onYes,
  text1,
  text2,
  children,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-[calc(100vw-32px)] max-w-[calc(var(--app-max-w)-32px)] rounded-xl ">
        <DialogTitle className="sr-only">모달</DialogTitle>
        {children}
        <div className="flex gap-3">
          <MainButton
            onClick={onClose}
            variant="secondary"
            className="max-w-sm"
          >
            {text1 || "아니오"}
          </MainButton>
          <MainButton onClick={onYes || onClose} className="max-w-sm">
            {text2 || "예"}
          </MainButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
