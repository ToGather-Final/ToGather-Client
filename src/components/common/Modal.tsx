"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-[calc(100vw-32px)] max-w-[calc(var(--app-max-w)-32px)] rounded-xl ">
        {children}
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 bg-sky-500 hover:bg-sky-600
                 text-white rounded-2xl py-6 shadow-md"
        >
          확인
        </Button>
      </DialogContent>
    </Dialog>
  );
}
