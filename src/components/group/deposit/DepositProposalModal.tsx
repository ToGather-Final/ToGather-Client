"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import { DialogTitle } from "@/components/ui/dialog";
import YesNoModal from "../../common/YesNoModal";

interface DepositProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; dueDate: string; reason: string }) => void;
}

export default function DepositProposalModal({
  isOpen,
  onClose,
  onSubmit,
}: DepositProposalModalProps) {
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    onSubmit({
      amount,
      dueDate,
      reason,
    });
    onClose();
  };

  return (
    <YesNoModal
      isOpen={isOpen}
      onClose={handleSubmit}
      text1="취소"
      text2="제안하기"
    >
      <div className="text-center py-8">
        <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
          예수금 금액을 입력해주세요
        </DialogTitle>
        <p className="text-sm text-gray-600 mb-6">(1인당 예수금)</p>

        <div className="space-y-6">
          {/* 예수금 금액 입력 */}
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예수금 금액을 입력하세요"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              원
            </span>
          </div>

          {/* 마감일자 입력 */}
          <div>
            <label className="block text-left font-bold text-gray-900 mb-2">
              마감일자
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 제안 이유 입력 */}
          <div>
            <label className="block text-left font-bold text-gray-900 mb-2">
              제안 이유
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="제안 이유를 입력해주세요"
            />
          </div>
        </div>
      </div>
    </YesNoModal>
  );
}
