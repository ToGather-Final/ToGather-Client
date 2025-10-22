"use client"

import { useState } from "react"
import MainButton from "./MainButton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GroupConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function GroupConsentModal({ isOpen, onClose, onConfirm }: GroupConsentModalProps) {
  const [isAgreed, setIsAgreed] = useState(false)

  const handleConfirm = () => {
    if (isAgreed) {
      onConfirm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-auto w-[calc(100vw-24px)] max-w-lg rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pt-4">
          <DialogTitle className="text-2xl font-semibold text-gray-900 text-center">
            그룹 생성 전 꼭 확인해주세요!
          </DialogTitle>
        </DialogHeader>
        
        <div className="pt-4 px-6">
          <p className="text-sm text-stone-700 text-center mb-10">
            우리 그룹은 모두의 돈이 함께 움직이는 '공동 투자 그룹'이에요.
            <br />
            규칙에 동의해야만 그룹 생성 가능하며,
            <br />
            동의하지 않으면 그룹을 생성할 수 없습니다.
          </p>

          {/* 내용 */}
          <div className="space-y-4 text-sm text-stone-700">
            {/* 1. 매매 제안 & 투표 */}
            <div>
              <h3 className="font-semibold text-stone-900 mb-2">✅ 1. 매매 제안 & 투표</h3>
              <ul className="space-y-1 pl-4">
                <li>• 매매는 그룹원 누구나 제안할 수 있습니다.</li>
                <li>• 제안이 올라오면, 투표 종료 시각까지 다른 그룹원들이 찬성/반대 투표를 진행합니다.</li>
                <li>• 투표 결과는 그룹장이 설정한 정족수를 기준으로 결정되며, 정족수를 만족하면 즉시 투표가 가결됩니다.</li>
                <li>• 가결된 제안은 자동으로 매매 절차가 실행됩니다</li>
              </ul>
            </div>

            {/* 2. 매매 방식 */}
            <div>
              <h3 className="font-semibold text-stone-900 mb-2">💰 2. 매매 방식</h3>
              <ul className="space-y-1 pl-4">
                <li>• 투표가 가결되면, 매매 금액 ÷ 그룹원 수 만큼 각자의 <strong>CMA 투자 계좌(개인 명의)</strong>에서 자동으로 분할 매매가 진행됩니다.</li>
                <li>• 그룹 포트폴리오 화면에 표시되는 자산은 그룹원들의 개인 투자 계좌를 합산한 값이에요.</li>
                <li>• 즉, 실제 거래는 각자의 개인 계좌에서 개별적으로 실행됩니다.</li>
                <li>• 공동 투자로 인한 수익 또는 손실은 각자의 계좌에 비율대로 반영됩니다.</li>
              </ul>
            </div>

            {/* 3. 정보 및 동의 원칙 */}
            <div>
              <h3 className="font-semibold text-stone-900 mb-2">🔒 3. 정보 및 동의 원칙</h3>
              <ul className="space-y-1 pl-4">
                <li>• 그룹 활동을 위해, 이름, 계좌 정보, 거래 내역 등 최소한의 개인정보가 서비스 내에서 활용됩니다.</li>
                <li>• 해당 정보는 공동 투자 실행, 자산 집계, 히스토리 기록 등 서비스 운영 목적에만 사용됩니다.</li>
                <li>• 그룹 참여 시, 아래 사항에 모두 동의한 것으로 간주됩니다.</li>
              </ul>
              
              <div className="mt-3 pl-4 space-y-1">
                <p>1. 공동 투자 구조상, 투자 결과(수익·손실)는 개별 계좌에 직접 반영됨을 이해합니다.</p>
                <p>2. 매매 제안 및 투표 결과에 따라 자동으로 매매가 체결될 수 있음을 동의합니다.</p>
                <p>3. 페이 계좌(그룹장 명의)로의 송금 및 예수금 충전 등은 제안·투표 절차를 거쳐 이루어짐을 이해합니다.</p>
                <p>4. 개인정보는 서비스 이용 중 안전하게 보호되며, 제3자에게 제공되지 않습니다.</p>
              </div>
            </div>

            {/* 동의 문구 */}
            <div className="mt-6 p-4 bg-stone-50 rounded-xl">
              <p className="text-sm text-stone-800 font-medium">
                본인은 위 내용을 충분히 이해하였으며,
                <br />
                공동 투자 그룹 운영 방식 및 개인정보 활용에 동의합니다.
              </p>
            </div>
          </div>

          {/* 체크박스 */}
          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="consent-checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="w-5 h-5 text-sky-600 bg-stone-100 border-stone-300 rounded focus:ring-sky-500 focus:ring-2"
            />
            <label htmlFor="consent-checkbox" className="text-sm text-stone-700">
              위 내용을 모두 확인했으며 동의합니다
            </label>
          </div>

          {/* 버튼들 */}
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
              onClick={handleConfirm}
              disabled={!isAgreed}
              className="flex-1"
            >
              계속하기
            </MainButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
