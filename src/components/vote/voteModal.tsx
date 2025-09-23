"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  voteType: "approve" | "reject";
  onConfirm: () => void;
}

export default function VoteModal({
  isOpen,
  onClose,
  voteType,
  onConfirm,
}: VoteModalProps) {
  const isApprove = voteType === "approve";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={`text-center ${
              isApprove ? "text-blue-600" : "text-red-600"
            }`}
          >
            {isApprove ? "찬성" : "반대"}
          </DialogTitle>
          <DialogDescription className="text-center">
            이 투표에 {isApprove ? "찬성" : "반대"}하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent"
          >
            취소
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${
              isApprove
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isApprove ? "찬성" : "반대"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
