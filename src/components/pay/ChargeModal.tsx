"use client";

import { Button } from "@/components/ui/button";
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
  onConfirm: (data: {
    amount: string;
    dueDate: string;
    reason: string;
  }) => void;
}

export default function ChargeModal({
  isOpen,
  onClose,
  onConfirm,
}: ChargeModalProps) {
  const amountId = useId();
  const dueId = useId();
  const reasonId = useId();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      amount: formData.get("amount") as string,
      dueDate: formData.get("dueDate") as string,
      reason: formData.get("reason") as string,
    };
    onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-[calc(100vw-32px)] max-w-[calc(var(--app-max-w)-32px)] rounded-xl ">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            <span className="text-sky-600 font-semibold">1인 충전 금액</span>을
            입력해주세요
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            충전 금액과 마감일, 제안 이유를 입력해주세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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

          {/* 마감 일자 */}
          <div className="space-y-1">
            <label htmlFor={dueId} className="text-sm text-stone-700">
              마감 일자
            </label>
            <Input id={dueId} name="dueDate" type="date" required />
          </div>

          {/* 제안 이유 */}
          <div className="space-y-1">
            <label htmlFor={reasonId} className="text-sm text-stone-700">
              제안 이유
            </label>
            <textarea
              id={reasonId}
              name="reason"
              rows={4}
              placeholder="제안 이유를 입력해주세요."
              className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 border-gray-200 
                 hover:bg-gray-200 rounded-2xl py-6 shadow-md"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-sky-500 hover:bg-sky-600 
                 text-white rounded-2xl py-6 shadow-md"
            >
              제안하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
