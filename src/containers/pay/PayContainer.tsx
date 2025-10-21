"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MainButton from "@/components/common/MainButton";
import ChargeModal from "@/components/pay/ChargeModal";
import { usePayTab } from "@/contexts/payTabContext";
import QRScannerContainer from "./QRScannerContainer";
import { useGroupId } from "@/contexts/groupIdContext";
import { rechargePay, getGroupPayInfo, getTransactionHistory, processPayment, resolveQR, GroupPayAccountInfo, TransactionHistoryItem, PaymentRequest, QRResolveResponse } from "@/utils/api/transfers";
import TransferModal from "@/components/pay/TransferModal";

const currency = new Intl.NumberFormat("ko-KR");

export default function PayContainer() {
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [qrResolveData, setQrResolveData] = useState<QRResolveResponse | null>(null);
  const [scannedQrCode, setScannedQrCode] = useState<string>("");
  const { payTab, setPayTab } = usePayTab();
  const { groupId } = useGroupId();
  const [accountNo, setAccountNo] = useState<string>("-");
  const [payMoney, setPayMoney] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<{createdAt?: string, id?: string} | null>(null);
  const [groupAccountId, setGroupAccountId] = useState<string>("");

  // 터치 이벤트를 위한 ref와 상태
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      const info: GroupPayAccountInfo = await getGroupPayInfo(groupId);
      setAccountNo(info.accountNumber);
      setPayMoney(info.balance);
      setGroupAccountId(info.id); // 그룹 계좌 ID 저장
      
      // 계좌 정보를 받아온 후 거래 내역 조회
      await loadTransactionHistory(info.id);
    } catch (e) {
      console.error('Failed to load group pay info', e);
    }
  };

  // 거래 내역 조회 (초기 로드)
  const loadTransactionHistory = async (accountId: string, reset: boolean = true) => {
    if (!accountId) return;
    
    if (reset) {
      setIsLoadingTransactions(true);
      setTransactions([]);
      setHasMore(true);
      setNextCursor(null);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const response = await getTransactionHistory(
        accountId, 
        10, // 한 번에 10개씩
        undefined, // type 필터 없음
        nextCursor?.createdAt,
        nextCursor?.id
      );
      
      if (reset) {
        setTransactions(response.items || []);
      } else {
        setTransactions(prev => [...prev, ...(response.items || [])]);
      }
      
      setHasMore(response.hasMore);
      setNextCursor({
        createdAt: response.nextCursorCreatedAt,
        id: response.nextCursorId
      });
    } catch (e) {
      console.error('Failed to load transaction history', e);
      if (reset) {
        setTransactions([]);
      }
    } finally {
      setIsLoadingTransactions(false);
      setIsLoadingMore(false);
    }
  };

  // 더 많은 거래 내역 로드 (무한 스크롤)
  const loadMoreTransactions = async () => {
    if (!groupAccountId || !hasMore || isLoadingMore) return;
    await loadTransactionHistory(groupAccountId, false);
  };

  // QR 스캔 처리
  const handleQrScan = async (qrData: string) => {
    console.log('📱 QR 스캔 결과:', qrData);
    setScannedQrCode(qrData);
    
    try {
      // QR 코드 해석
      const resolveData = await resolveQR(qrData);
      console.log('🔍 QR 해석 결과:', resolveData);
      setQrResolveData(resolveData);
      setIsTransferModalOpen(true);
    } catch (e) {
      console.error('QR 해석 실패:', e);
      alert('QR 코드를 해석할 수 없습니다. 다시 시도해주세요.');
    }
  };

  // 결제 처리
  const handleTransferConfirm = async (data: { amount: string }) => {
    try {
      if (!groupAccountId) throw new Error('그룹 계좌 정보가 없습니다.');
      if (!qrResolveData) throw new Error('QR 해석 데이터가 없습니다.');
      
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
        recipientName: qrResolveData.recipient.recipientName,
        recipientBankName: qrResolveData.recipient.bankName,
        recipientAccountNumber: qrResolveData.recipient.maskedAccountNo,
        clientRequestId: clientRequestId,
      };

      await processPayment(paymentData);
      setIsTransferModalOpen(false);
      setQrResolveData(null);
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

  // payTab이 "바코드"로 변경될 때 거래 내역 새로고침
  useEffect(() => {
    if (payTab === "BARCODE" && groupAccountId) {
      loadTransactionHistory(groupAccountId);
    }
  }, [payTab, groupAccountId]);

  // 무한 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || !hasMore || isLoadingMore) return;
      
      const { scrollTop, scrollHeight, clientHeight } = target;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 화면 끝에 도달
      
      if (isAtBottom) {
        loadMoreTransactions();
      }
    };

    const scrollArea = scrollAreaRef.current;
    const container = containerRef.current;
    
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
    }
    
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      if (scrollArea) scrollArea.removeEventListener('scroll', handleScroll);
      if (container) container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoadingMore, groupAccountId, transactions.length, nextCursor]);

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
        <div className="h-full flex flex-col">
          {/* 상단 고정 영역 */}
          <div className="px-6 py-6 flex-shrink-0">
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

          {/* 스크롤 가능한 거래 내역 영역 */}
          <section ref={scrollAreaRef} className="bg-[#E5F0FE] px-4 py-4 flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
            <h2 className="text-sm font-semibold text-stone-800 my-2">
              최근 거래 내역
            </h2>

            <div className="space-y-2 pb-20">
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
                        (tx.type === "TRANSFER_IN" ? "text-sky-600" : "text-red-500")
                      }
                    >
                      {tx.type === "TRANSFER_IN" ? "+" : "-"}
                      {currency.format(Math.abs(tx.amount))}원
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">거래 내역이 없습니다.</p>
                </div>
              )}
              
              {/* 무한 스크롤 로딩 상태 */}
              {transactions && transactions.length > 0 && (
                <div className="mt-4">
                  {isLoadingMore ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">더 많은 거래 내역을 불러오는 중...</p>
                    </div>
                  ) : !hasMore ? (
                    <div className="text-center py-8">
                    </div>
                  ) : null}
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
        onClose={() => {
          setIsTransferModalOpen(false);
          setQrResolveData(null);
        }}
        onConfirm={handleTransferConfirm}
        recipientName={qrResolveData?.recipient.recipientName || "수신자"}
        suggestedAmount={qrResolveData?.suggestedAmount || 0}
      />
    </div>
  );
}
