"use client";

import { useEffect, useState } from "react";
// @ts-ignore
import confetti from "canvas-confetti";
import { DialogTitle } from "@/components/ui/dialog";
import YesNoModal from "@/components/common/YesNoModal";
import SetGoalModal from "@/components/group/goal/SetGoalModal";
import GoalCompleteModal from "@/components/group/goal/GoalCompleteModal";

export default function CelebrateContainer() {
  useEffect(() => {
    // 직사각형 모양의 컨페티 생성
    const createRectangularConfetti = () => {
      const colors = ["#e53e3e", "#2b6cb0", "#38a169", "#d69e2e"];

      // 여러 번 발사하여 지속적인 효과
      const interval = setInterval(() => {
        confetti({
          particleCount: 10,
          spread: 70,
          origin: { y: 0 },
          colors: colors,
          shapes: ["square"], // 직사각형 모양
          gravity: 1.5, // 중력 증가로 화면 밑까지 내려오도록
          ticks: 300, // 더 오래 살아있도록
        });
      }, 300);

      return () => clearInterval(interval);
    };

    const cleanup = createRectangularConfetti();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(true);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [goalAmount, setGoalAmount] = useState(150000);

  const handleYesClick = () => {
    setIsMemberModalOpen(false);
    setIsGoalModalOpen(true);
  };

  const handleGoalComplete = (amount: number) => {
    console.log("목표 금액 설정:", amount);
    setGoalAmount(amount);
    setIsCompleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Confetti canvas - 배경 레이어 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <canvas
          id="confetti-canvas"
          className="w-full h-full"
          style={{ zIndex: -1 }}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8 relative z-10">
        <YesNoModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          onYes={handleYesClick}
        >
          <div className="text-center py-8">
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
              목표 금액을 달성했습니다!
            </DialogTitle>
            <div className="max-h-[50dvh] overflow-y-auto">
              <p className="text-lg text-gray-700">
                목표 금액을 재설정하시겠습니까?
              </p>
            </div>
          </div>
        </YesNoModal>

        {/* 목표 금액 설정 모달 */}
        <SetGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          onComplete={handleGoalComplete}
          initialAmount={goalAmount}
        />

        {/* 목표 금액 설정 완료 모달 */}
        <GoalCompleteModal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          goalAmount={goalAmount}
        />
      </div>
    </div>
  );
}
