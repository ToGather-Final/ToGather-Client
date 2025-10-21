"use client";

import React, { useState } from "react";
import YesNoModal from "@/components/common/YesNoModal";
import { Input } from "@/components/ui/input";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { amount: string }) => void;
  recipientName?: string;
  defaultAmount?: number;
}

export default function TransferModal({
  isOpen,
  onClose,
  onConfirm,
  recipientName = "수신자",
  defaultAmount = 0,
}: TransferModalProps) {
  const [amount, setAmount] = useState<string>(defaultAmount.toString());

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, ""); // 숫자만
    setAmount(digits);
  };

  const handleYes = () => {
    const numAmount = Number(amount || "0");
    if (numAmount > 0) {
      onConfirm({ amount });
    }
  };

  const formatAmount = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <YesNoModal
      isOpen={isOpen}
      onClose={onClose}
      onYes={handleYes}
      text2="송금하기"
      text1="취소"
    >
      <div className="text-start">
        <div className="text-gray-900 text-xl mb-6 ">
          <span className="text-blue-600">{recipientName}</span>으로 얼마를
          송금하시겠습니까?
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-left text-[#686868] mb-2 mt-4">
              송금 금액
            </label>
            <div className="flex items-center gap-2 justify-center mb-4">
              <Input
                type="text"
                inputMode="numeric"
                value={formatAmount(amount)}
                onChange={handleAmountChange}
                className="w-full px-5 py-5 border border-gray-300 rounded-lg focus:outline-none focus:border-transparent"
                placeholder="송금 금액을 입력하세요"
              />
              <span className="text-[#686868] font-medium">원</span>
            </div>
          </div>
        </div>
      </div>
    </YesNoModal>
  );
}
