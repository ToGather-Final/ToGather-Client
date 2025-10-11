"use client";

import Modal from "@/components/common/Modal";
import { DialogTitle } from "@/components/ui/dialog";

interface DepositCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositCompleteModal({
  isOpen,
  onClose,
}: DepositCompleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center py-8">
        <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
          예수금 제안 완료
        </DialogTitle>
        <div className="mb-6">
          <p className="text-lg text-gray-700">예수금 제안이 완료되었습니다.</p>
        </div>
      </div>
    </Modal>
  );
}
