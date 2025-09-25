"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VoteModalProps {
  isOpen: boolean;                      //모달 열림 여부
  onClose: () => void;                  // 모달 닫기 핸들러(ESC/바깥클릭 포함)
  voteType: "approve" | "reject";       // 모달 문구를 '찬성' or '반대'로 표시
  proposalName: string;                 // 제안 제목(설명 영역에 노출)
  onConfirm: () => void;                // '예' 클릭 시 호출
}

// VoteModal 컴포넌트 : “찬성/반대” 버튼 누르면 뜨는 확인 창.
export default function VoteModal({
  isOpen,
  onClose,
  voteType,
  proposalName,
  onConfirm,
}: VoteModalProps) {
  const isApprove = voteType === "approve";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm mx-4 rounded-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isApprove
              ? "찬성에 투표할까요?"
              : "반대에 투표할까요?"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {proposalName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 border-gray-200 
               hover:bg-gray-200 rounded-2xl py-6 shadow-md"
          >
            아니오
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-blue-500 hover:bg-blue-600 
               text-white rounded-2xl py-6 shadow-md"
          >
            예
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
