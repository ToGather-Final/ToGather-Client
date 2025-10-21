"use client";

import { useEffect, useRef, useState } from "react";
// pnpm add qr-scanner
import QrScanner from "qr-scanner";
import TransferModal from "@/components/pay/TransferModal";

type Props = {
  onDetected?: (text: string) => void; // 스캔 성공 시 콜백(선택)
  onScan?: (qrData: string) => void; // QR 스캔 결과 콜백
  once?: boolean; // true면 한 번만 처리하고 멈춤
};

export default function QRScannerContainer({ onDetected, onScan, once = true }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const handledRef = useRef(false); // once 모드 중복 방지
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [scannedData, setScannedData] = useState<string>("");

  // 권한/카메라/보안 에러 메시지 구분
  const explainError = (e: DOMException | Error) => {
    const err = e;
    const name = (err as any)?.name ?? "";
    if (name === "NotAllowedError")
      return "카메라 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.";
    if (name === "NotFoundError")
      return "사용 가능한 카메라를 찾을 수 없습니다.";
    if (name === "NotReadableError")
      return "다른 앱이 카메라를 사용 중이거나 접근할 수 없습니다.";
    if (name === "SecurityError")
      return "보안 컨텍스트(HTTPS/localhost)가 아닙니다. HTTPS에서 시도해 주세요.";
    return err?.message ?? "카메라를 시작할 수 없습니다.";
  };

  // 스캐너 시작/정지
  useEffect(() => {
    if (!videoRef.current) return;

    // 기존 스캐너 정리
    scannerRef.current?.destroy();
    scannerRef.current = null;

    handledRef.current = false;
    setErrorMsg(null);

    // test/page.tsx와 같은 방식으로 QrScanner 생성
    const scanner = new QrScanner(
      videoRef.current,
      (res) => {
        const text =
          typeof res === "string"
            ? res
            : (res as any).data ?? res?.toString?.() ?? "";
        if (!text) return;
        setResult(text);
        setScannedData(text);
        navigator.vibrate?.(80);

        // onScan 콜백 호출 (부모 컴포넌트에서 처리)
        onScan?.(text);

        // 필요한 경우 URL 검증/정제
        onDetected?.(text);

        if (once && !handledRef.current) {
          handledRef.current = true;
          scanner.stop();
        }
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        maxScansPerSecond: 5,
        returnDetailedScanResult: true,
      }
    );

    // test/page.tsx와 같은 방식으로 카메라 확인 후 시작
    QrScanner.hasCamera().then((hasCamera) => {
      if (!hasCamera) {
        setErrorMsg("카메라가 없습니다.");
        return;
      }

      scanner.start().catch((e) => {
        setErrorMsg(explainError(e));
      });
    });

    scannerRef.current = scanner;

    return () => {
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [once, onDetected]);

  // 토치 토글 (지원 기기 한정)
  const toggleTorch = async () => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      const on = !torchOn;
      // QrScanner의 토치 기능이 없을 수 있으므로 try-catch로 처리
      if ("setTorch" in s && typeof s.setTorch === "function") {
        await s.setTorch(on);
        setTorchOn(on);
      } else {
        setErrorMsg("이 기기에서는 플래시를 사용할 수 없습니다.");
      }
    } catch {
      // 일부 기기는 미지원
      setErrorMsg("이 기기에서는 플래시를 사용할 수 없습니다.");
    }
  };

  // 송금 모달 핸들러
  const handleTransferConfirm = (data: { amount: string }) => {
    console.log(`송금 완료: ${data.amount}원을 ${scannedData}로 송금`);
    setIsTransferModalOpen(false);
    setResult(null);
    setScannedData("");

    // 스캐너 재시작 (once 모드가 아닌 경우)
    if (!once && scannerRef.current) {
      scannerRef.current.start();
    }
  };

  const handleTransferClose = () => {
    setIsTransferModalOpen(false);
    setResult(null);
    setScannedData("");

    // 스캐너 재시작 (once 모드가 아닌 경우)
    if (!once && scannerRef.current) {
      scannerRef.current.start();
    }
  };

  return (
    <div className="w-full h-full p-8">
      {/* 프리뷰 박스 */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          // iOS 자동재생/인라인 재생 힌트
          playsInline
          muted
          autoPlay
        />

        {/* 우측 상단 컨트롤(클릭 가능) */}
        <div className="absolute right-2 top-2 flex gap-2">
          <button
            type="button"
            className="pointer-events-auto bg-primary text-white text-sm px-2 py-1 rounded"
            onClick={toggleTorch}
            aria-pressed={torchOn}
          >
            {torchOn ? "플래시 끔" : "플래시 켬"}
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        {/* 안내 메시지 */}
        <div className="mt-3 text-sm text-center text-[#686868]">
          QR을 중앙 가이드 프레임에 맞춰 비춰주세요.
        </div>
        <div className="mt-3 text-sm break-all text-center">
          {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
        </div>
      </div>

      {/* 송금 모달 */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleTransferClose}
        onConfirm={handleTransferConfirm}
      />
    </div>
  );
}
