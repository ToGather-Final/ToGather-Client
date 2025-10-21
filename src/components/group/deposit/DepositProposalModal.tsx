"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import { DialogTitle } from "@/components/ui/dialog";
import YesNoModal from "../../common/YesNoModal";
import { createDepositProposal } from "@/services/vote/payDeposit";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 선택한 날짜/시간과 현재 시간의 차이를 분으로 계산
  const calculateDurationMinutes = (dateTimeString: string): number => {
    if (!dateTimeString) return 0;

    const now = new Date();
    const selectedTime = new Date(dateTimeString);

    const diffMs = selectedTime.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));

    return diffMinutes;
  };

  const handleSubmit = async () => {
    if (!amount || !dueDate || !reason) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const durationMinutes = calculateDurationMinutes(dueDate);

    if (durationMinutes < 0) {
      alert("마감일자를 현재보다 이후 시간으로 설정해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("=== 예수금 제안 시작 ===");
      console.log("Amount:", amount);
      console.log("DueDate:", dueDate);
      console.log("Duration Minutes:", durationMinutes);
      console.log("Reason:", reason);

      // API 호출
      await createDepositProposal({
        proposalName: "예수금 충전 제안",
        category: "PAY",
        action: "DEPOSIT",
        payload: {
          reason: reason,
          amountPerPerson: amount,
        },
        durationMinutes: durationMinutes,
      });

      console.log("✅ 예수금 제안 성공");

      // 성공 시 부모 컴포넌트에 전달
      onSubmit({
        amount,
        dueDate,
        reason,
      });

      onClose();
    } catch (error: any) {
      console.error("❌ 예수금 제안 실패:", error);
      alert(error?.message || "예수금 제안에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // 입력값 초기화
    setAmount(0);
    setDueDate("");
    setReason("");
    onClose();
  };

  return (
    <YesNoModal
      isOpen={isOpen}
      onClose={handleCancel}
      onYes={handleSubmit}
      text1="취소"
      text2={isSubmitting ? "제안 중..." : "제안하기"}
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
              disabled={isSubmitting}
              className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={3}
              placeholder="제안 이유를 입력해주세요"
            />
          </div>
        </div>
      </div>
    </YesNoModal>
  );
}
