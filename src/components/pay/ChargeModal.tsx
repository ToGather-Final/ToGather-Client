"use client";

import MainButton from "@/components/common/MainButton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useId } from "react";

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { amount: string }) => void;
}

export default function ChargeModal({
  isOpen,
  onClose,
  onConfirm,
}: ChargeModalProps) {
  const amountId = useId();
  

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      amount: formData.get("amount") as string,
    };
    onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-[calc(100vw-32px)] max-w-[calc(var(--app-max-w)-32px)] rounded-xl ">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            <span className="text-sky-600 font-semibold">페이 머니에 충전할 금액</span>을
            입력해주세요
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2 pt-4">
          {/* 금액 */}
          <div className="space-y-1">
            <label htmlFor={amountId} className="text-sm text-stone-700">
              충전 금액
            </label>
            <div className="relative">
              <Input
                id={amountId}
                name="amount"
                inputMode="numeric"
                placeholder=""
                className="pr-10"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500">
                원
              </span>
            </div>
          </div>

          {/* 마감일/제안이유 제거: 1인 금액만 입력 */}

          <div className="flex gap-3 pt-4">
            <MainButton
              type="button"
              onClick={onClose}
              className="flex-1"
              variant="secondary"
            >
              취소
            </MainButton>
            <MainButton
              type="submit"
              className="flex-1"
            >
              충전하기
            </MainButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
