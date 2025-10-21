"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import { DialogTitle } from "@/components/ui/dialog";
import YesNoModal from "@/components/common/YesNoModal";

interface SetGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (amount: number) => void;
  initialAmount?: number;
}

export default function SetGoalModal({
  isOpen,
  onClose,
  onComplete,
  initialAmount = 0,
}: SetGoalModalProps) {
  const [goalAmount, setGoalAmount] = useState(initialAmount);

  const handleSubmit = () => {
    onComplete(goalAmount);
    onClose();
  };

  return (
    <YesNoModal
      isOpen={isOpen}
      onClose={onClose}
      onYes={handleSubmit}
      text1="취소"
      text2="설정"
    >
      <div className="text-center py-8">
        <DialogTitle className="text-2xl font-bold text-gray-900 mb-6">
          목표 금액 설정
        </DialogTitle>
        <div className="mb-6">
          <div className="relative">
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(Number(e.target.value))}
              className="w-full px-4 py-3 text-xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="150,000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              원
            </span>
          </div>
        </div>
      </div>
    </YesNoModal>
  );
}
