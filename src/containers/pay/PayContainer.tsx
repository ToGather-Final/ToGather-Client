"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MainButton from "@/components/common/MainButton";
import ChargeModal from "@/components/pay/ChargeModal";
import { usePayTab } from "@/contexts/payTabContext";
import QRScannerContainer from "./QRScannerContainer";
import { useGroupId } from "@/contexts/groupIdContext";
import { rechargePay, getGroupPayInfo, getTransactionHistory, processPayment, GroupPayAccountInfo, TransactionHistoryItem, PaymentRequest } from "@/utils/api/transfers";
import TransferModal from "@/components/pay/TransferModal";

const currency = new Intl.NumberFormat("ko-KR");

export default function PayContainer() {
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [qrRecipientInfo, setQrRecipientInfo] = useState<string>("");
  const [scannedQrCode, setScannedQrCode] = useState<string>("");
  const { payTab, setPayTab } = usePayTab();
  const { groupId } = useGroupId();
  const [accountNo, setAccountNo] = useState<string>("-");
  const [payMoney, setPayMoney] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [groupAccountId, setGroupAccountId] = useState<string>("");

  // 터치 이벤트를 위한 ref와 상태
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChargeConfirm = async (data: { amount: string }) => {
    try {
      if (!groupId) throw new Error('그룹이 선택되지 않았습니다.');
      const amount = Number(data.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('올바른 금액을 입력하세요.');
      }
      await rechargePay(groupId, amount);
      setIsChargeModalOpen(false);
      alert('페이 머니에 충전을 완료했습니다.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '충전 요청에 실패했습니다.';
      alert(msg);
    }
  };

  // 그룹 페이 계좌/잔액 조회
  const loadGroupPay = async () => {
    if (!groupId) return;
    try {
      console.log('🏦 loadGroupPay 시작, groupId:', groupId);
      const info: GroupPayAccountInfo = await getGroupPayInfo(groupId);
      console.log('🏦 계좌 정보 응답:', info);
      setAccountNo(info.accountNumber);
      setPayMoney(info.balance);
      setGroupAccountId(info.id); // 그룹 계좌 ID 저장
      
      // 계좌 정보를 받아온 후 거래 내역 조회
      console.log('🏦 거래 내역 조회 시작, accountId:', info.id);
      await loadTransactionHistory(info.id);
    } catch (e) {
      console.error('Failed to load group pay info', e);
    }
  };

  // 거래 내역 조회
  const loadTransactionHistory = async (accountId: string) => {
    if (!accountId) return;
    
    console.log('🔍 loadTransactionHistory 시작, accountId:', accountId);
    setIsLoadingTransactions(true);
    try {
      const response = await getTransactionHistory(accountId, 10); // 최근 10개만 조회
      console.log('📊 거래 내역 API 응답:', response);
      console.log('📊 response.items:', response.items);
      console.log('📊 response.items.length:', response.items?.length);
      
      // id가 null인 항목들에 대해 경고만 출력하고 모든 항목을 표시
      (response.items || []).forEach((tx, index) => {
        if (!tx.id) {
          console.warn(`⚠️ 거래 내역 ${index}번째 항목의 id가 null입니다:`, tx);
        }
      });
      
      setTransactions(response.items || []);
      console.log('📊 transactions 상태 설정 완료:', response.items || []);
    } catch (e) {
      console.error('Failed to load transaction history', e);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // QR 스캔 처리
  const handleQrScan = (qrData: string) => {
    console.log('📱 QR 스캔 결과:', qrData);
    setScannedQrCode(qrData);
    setQrRecipientInfo("교대이층집"); // 고정값
    setIsTransferModalOpen(true);
  };

  // 결제 처리
  const handleTransferConfirm = async (data: { amount: string }) => {
    try {
      if (!groupAccountId) throw new Error('그룹 계좌 정보가 없습니다.');
      
      const amount = Number(data.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('올바른 금액을 입력하세요.');
      }

      const clientRequestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

      const paymentData: PaymentRequest = {
        payerAccountId: groupAccountId,
        amount: amount,
        recipientName: "교대이층집",
        recipientBankName: "신한은행",
        recipientAccountNumber: "1234567890123456", // 임시 계좌번호
        clientRequestId: clientRequestId,
      };

      await processPayment(paymentData);
      setIsTransferModalOpen(false);
      alert('송금이 완료되었습니다.');
      
      // 거래 내역 새로고침
      if (groupAccountId) {
        await loadTransactionHistory(groupAccountId);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '송금에 실패했습니다.';
      alert(msg);
    }
  };

  // 최초 및 groupId 변경 시 로드
  useEffect(() => {
    loadGroupPay();
  }, [groupId]);

  // 터치 시작 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  // 터치 종료 이벤트 핸들러
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  // 스와이프 처리 함수
  const handleSwipe = () => {
    const swipeThreshold = 50; // 최소 스와이프 거리
    const swipeDistance = touchEndX.current - touchStartX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && payTab === "QR") {
        // 오른쪽으로 스와이프 (바코드로 보기)
        setPayTab("BARCODE");
      } else if (swipeDistance < 0 && payTab === "BARCODE") {
        // 왼쪽으로 스와이프 (QR로 보기)
        setPayTab("QR");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-full touch-pan-y"
    >
      {/* 바코드 탭 화면 */}
      {payTab === "BARCODE" && (
        <div className="h-full ">
          <div className="px-6 py-6 ">
            {/* 바코드 + QR 영역 */}
            <div className="flex gap-6 items-center justify-center">
              {/* 바코드 더미 */}
              <div className="w-8/12 h-20 bg-[repeating-linear-gradient(90deg,black_0_2px,transparent_2px_6px)] rounded-sm" />
              {/* QR 더미 */}
              <div className="size-20 grid grid-cols-4 grid-rows-4 gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={i % 3 === 0 ? "bg-black" : "bg-stone-200"}
                  />
                ))}
              </div>
            </div>

            {/* 계좌/잔액 정보 */}
            <div>
              <div className="flex items-center justify-between text-sm mt-8">
                <span className="text-stone-700 font-medium text-lg">계좌</span>
                <span className=" tracking-wide text-stone-900 text-h2">
                  {accountNo}
                </span>
              </div>
              <div className="border-t border-[#e9e9e9] my-6"></div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-700 font-medium text-lg">
                  페이 머니
                </span>
                <span className=" text-stone-900 text-h2">
                  {currency.format(payMoney)}원
                </span>
              </div>
            </div>
          </div>

          {/* 최근 거래 내역 */}
          <section className="bg-[#E5F0FE] px-4 py-4 h-full">
            <h2 className="text-sm font-semibold text-stone-800 my-2">
              최근 거래 내역
            </h2>

            <div className="space-y-2">
              {isLoadingTransactions ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">거래 내역을 불러오는 중...</p>
                </div>
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <div
                    key={tx.id || `transaction-${index}-${tx.createdAt}`}
                    className="rounded-xl border border-stone-200 px-4 py-3 shadow-xs bg-white flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-stone-800">{tx.description}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        }).replace(/\./g, '.').replace(/,/g, '')}
                      </div>
                    </div>
                    <div
                      className={
                        "text-sm font-semibold ml-2 " +
                        (tx.amount >= 0 ? "text-sky-600" : "text-stone-500")
                      }
                    >
                      {tx.amount >= 0 ? "+" : "-"}
                      {currency.format(Math.abs(tx.amount))}원
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">거래 내역이 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* 고정 떠있는 충전 버튼 - 바코드 탭에서만 표시 */}
      {payTab === "BARCODE" && (
        <MainButton
          onClick={() => setIsChargeModalOpen(true)}
          className="fixed left-1/2 -translate-x-1/2 bottom-[80px] w-[calc(100vw-32px)] max-w-[calc(var(--app-max-w)-64px)]"
        >
          페이 머니 충전
        </MainButton>
      )}

      {/* 충전 모달 */}
      <ChargeModal
        isOpen={isChargeModalOpen}
        onClose={() => setIsChargeModalOpen(false)}
        onConfirm={handleChargeConfirm}
      />

      {/* QR 탭 화면 */}
      {payTab === "QR" && (
        <div className="bg-[#E5F0FE] h-full">
          <QRScannerContainer once onScan={handleQrScan} />
        </div>
      )}

      {/* 송금 모달 */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onConfirm={handleTransferConfirm}
        recipientName={qrRecipientInfo}
      />
    </div>
  );
}
