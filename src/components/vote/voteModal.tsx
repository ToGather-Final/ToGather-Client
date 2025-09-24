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
  isOpen: boolean;
  onClose: () => void;
  voteType: "approve" | "reject";
  proposalName: string;
  onConfirm: () => void;
}

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
      <DialogContent className="sm:max-w-sm mx-4 rounded-2xl">
        <DialogHeader className="text-center space-y-3 pt-4">
          <DialogTitle className="text-lg font-medium text-gray-900">
            {isApprove
              ? "찬성에 투표하시겠습니까?"
              : "반대에 투표하시겠습니까?"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {proposalName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4 pb-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 rounded-lg py-3"
          >
            아니오
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3"
          >
            예
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
