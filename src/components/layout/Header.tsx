"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, CreditCard } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Modal from "@/components/common/Modal";
import { DialogTitle } from "../ui/dialog";
import { Copy, Check } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const payActive = pathname === "/pay" || pathname.startsWith("/pay/");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRuleClick = () => {
    setIsRuleModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleMemberClick = () => {
    setIsMemberModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleCodeClick = () => {
    setIsCodeModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleCopyCode = async () => {
    const groupCode = "1782jedi3jjdkd";
    try {
      await navigator.clipboard.writeText(groupCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 2초 후 복사 상태 초기화
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  return (
    <header
      className="h-[var(--header-h)] sticky top-0 z-10
                 bg-white border-b border-stone-200
                 flex items-center gap-3 px-4"
    >
      <Image src="/logo.png" alt="logo" width={35} height={35} />
      <div
        className="w-full flex justify-center items-center gap-1 relative"
        ref={dropdownRef}
      >
        <button
          onClick={handleDropdownToggle}
          className="flex items-center gap-1 px-2 py-1 rounded transition-colors"
        >
          <div>그룹명</div>
          <ChevronDown
            className={`transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
            size={16}
          />
        </button>

        {/* 드롭다운 메뉴 */}
        {isDropdownOpen && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              <div
                className="px-4 py-2 text-sm text-center text-gray-600 hover:bg-gray-50 cursor-pointer"
                onClick={handleRuleClick}
              >
                모임 규칙
              </div>
              <div
                className="px-4 py-2 text-sm text-center text-gray-600 hover:bg-gray-50 cursor-pointer"
                onClick={handleMemberClick}
              >
                그룹원
              </div>
              <div
                className="px-4 py-2 text-sm text-center text-gray-600 hover:bg-gray-50 cursor-pointer"
                onClick={handleCodeClick}
              >
                그룹 코드
              </div>
            </div>
          </div>
        )}
      </div>
      <Link
        href="/pay"
        aria-label="페이"
        className={`ml-auto inline-flex items-center justify-center
                    size-9 rounded-lg transition
                    ${
                      payActive
                        ? "bg-stone-100 text-stone-900"
                        : "text-stone-500 hover:bg-stone-50"
                    }`}
      >
        <CreditCard size={25} className="stroke-current" />
      </Link>

      {/* 모임 규칙 모달 */}
      <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)}>
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            그룹 규칙
          </DialogTitle>
          <div className="max-h-[50dvh] overflow-y-auto">
            <p className="text-lg text-gray-700">
              ✅ 그룹 생성 & 참여 그룹장은 모임 이름, 인원, 초기 투자금 등을
              설정합니다. 참여자는 그룹 규칙 확인 후 반드시 동의해야 가입할 수
              있습니다. <br />
              <br />
              💹 매매 방식 매매가 발생하면, (매매 금액 ÷ 그룹원 수) 만큼 각자의
              투자 계좌에서 차감됩니다. 즉, 모든 투자 활동은 그룹원 수만큼 균등
              분할됩니다. <br />
              <br />
              💳 페이 관리 페이 활성화 및 충전은 그룹장만 가능합니다. 충전이
              확정되면, 각 그룹원의 투자 계좌 예수금으로 균등 분할되어
              입금됩니다. 충전된 페이머니는 그룹장만 관리할 수 있습니다.
              <br />
              💳 페이 관리 페이 활성화 및 충전은 그룹장만 가능합니다. 충전이
              확정되면, 각 그룹원의 투자 계좌 예수금으로 균등 분할되어
              입금됩니다. 충전된 페이머니는 그룹장만 관리할 수 있습니다.
              <br />
              💳 페이 관리 페이 활성화 및 충전은 그룹장만 가능합니다. 충전이
              확정되면, 각 그룹원의 투자 계좌 예수금으로 균등 분할되어
              입금됩니다. 충전된 페이머니는 그룹장만 관리할 수 있습니다.
            </p>
          </div>
        </div>
      </Modal>

      {/* 그룹원 모달 */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      >
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            그룹원
          </DialogTitle>
          <div className="max-h-[50dvh] overflow-y-auto">
            <p className="text-lg text-gray-700">
              지구
              <br />
              카리나팬
              <br />
              차니차니
              <br />
              이브이조아
              <br />
              룰루랄라
            </p>
          </div>
        </div>
      </Modal>

      {/* 그룹 코드 모달 */}
      <Modal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
            그룹 코드
          </DialogTitle>
          <div className="max-h-[50dvh] overflow-y-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <p className="text-2xl font-mono font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
                1782jedi3jjdkd
              </p>
              <button
                onClick={handleCopyCode}
                className={"p-2 rounded-lg transition-colors text-gray-600"}
              >
                {isCopied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            {isCopied && (
              <p className="text-sm text-blue-600 font-medium">
                클립보드에 복사되었습니다!
              </p>
            )}
          </div>
        </div>
      </Modal>
    </header>
  );
}
