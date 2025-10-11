"use client";

import Modal from "@/components/common/Modal";
import { DialogTitle } from "@/components/ui/dialog";

interface GoalCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalAmount: number;
}

export default function GoalCompleteModal({
  isOpen,
  onClose,
  goalAmount,
}: GoalCompleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center py-8">
        <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
          목표 금액 설정 완료
        </DialogTitle>
        <div className="mb-6">
          <p className="text-lg text-gray-700">
            {goalAmount.toLocaleString()}원으로 목표 금액이 재설정되었습니다.
          </p>
        </div>
      </div>
    </Modal>
  );
}
