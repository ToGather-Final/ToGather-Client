"use client";

import TermsModal from "./TermsModal";

interface PayTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PayTermsModal({ isOpen, onClose }: PayTermsModalProps) {
  return (
    <TermsModal isOpen={isOpen} onClose={onClose} title="페이계좌 이용약관">
      <div className="space-y-3 text-xs leading-tight">
        <section>
          <h3 className="font-bold text-xs mb-1">제1조 (목적)</h3>
          <p>
            본 약관은 ToGather 주식회사(이하 "회사")가 제공하는 페이계좌(그룹형 결제 계좌) 서비스의 이용조건 및 절차를 규정함을 목적으로 합니다.
          </p>
          <p className="mt-1">
            회사는 「전자금융거래법」에 따라 이용자의 결제정보 보호와 안전한 서비스 제공을 위해 본 약관을 제정합니다.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제2조 (페이계좌의 개설 및 성격)</h3>
          <ul className="space-y-1">
            <li>• 페이계좌는 그룹장이 개설하여 그룹 구성원 간 자금을 공동으로 관리하고, 결제·이체·정산 기능을 수행하는 실계좌입니다.</li>
            <li>• 회사는 페이계좌의 결제 처리를 위해 제휴 금융기관과 연동하며, 거래내역은 금융기관 시스템을 통해 관리됩니다.</li>
            <li>• 그룹원은 그룹장이 승인한 범위 내에서 송금, 결제, 조회 등의 기능을 이용할 수 있습니다.</li>
            <li>• 페이계좌는 실명인증을 완료한 사용자만 개설 및 이용할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제3조 (자금의 입출금 및 결제)</h3>
          <ul className="space-y-1">
            <li>• 페이계좌에 입금된 금전은 그룹의 공용자금으로 사용됩니다.</li>
            <li>• 그룹장은 결제, 이체, 정산 등의 권한을 가지며, 거래내역은 모든 그룹원에게 투명하게 공개됩니다.</li>
            <li>• 회사는 각 거래에 대해 실시간 알림 및 거래명세서를 제공합니다.</li>
            <li>• 결제 시 이용자의 잔액이 부족할 경우 거래가 거절될 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제4조 (QR결제 및 보안)</h3>
          <ul className="space-y-1">
            <li>• 회사는 QR결제 또는 결제링크를 통해 그룹 결제를 지원하며, 모든 결제세션은 일회성으로 생성됩니다.</li>
            <li>• QR에는 결제 대상 계좌번호 및 금액 등이 암호화되어 포함되며, 위변조 방지를 위해 전자서명(HMAC 또는 RSA)이 적용됩니다.</li>
            <li>• 결제세션은 최대 15분간 유효하며, 만료 시 결제가 불가능합니다.</li>
            <li>• 회사는 이상거래 탐지 시스템(FDS)을 통해 부정결제를 실시간 탐지하고 차단합니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제5조 (이용자 의무)</h3>
          <ul className="space-y-1">
            <li>• 이용자는 페이계좌의 접근수단(비밀번호, 인증수단 등)을 제3자에게 제공해서는 안 됩니다.</li>
            <li>• 이용자는 결제 실행 전 수취인 계좌정보를 반드시 확인해야 합니다.</li>
            <li>• 허위 거래, 자금세탁, 범죄자금 이체 등의 불법행위를 해서는 안 됩니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제6조 (수수료 및 한도)</h3>
          <ul className="space-y-1">
            <li>• 회사는 결제 또는 송금 건에 대해 수수료를 부과할 수 있으며, 요율은 서비스 화면에 고지합니다.</li>
            <li>• 회사는 보안 및 정책상 필요에 따라 일일 이체한도, 거래한도를 설정할 수 있습니다.</li>
            <li>• 수수료 및 한도 변경 시 사전 공지합니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제7조 (개인정보 처리)</h3>
          <ul className="space-y-1">
            <li>• 회사는 결제 및 계좌관리 목적 범위 내에서만 이용자의 개인정보를 수집·이용합니다.</li>
            <li>• 개인정보는 「개인정보보호법」, 「전자금융거래법」 등 관련 법령에 따라 안전하게 보호됩니다.</li>
            <li>• 회사는 이용자의 결제내역, 계좌정보를 법령이 정한 기간 동안 보관합니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제8조 (이용제한 및 해지)</h3>
          <ul className="space-y-1">
            <li>• 다음의 경우 회사는 페이계좌 이용을 정지하거나 해지할 수 있습니다.</li>
            <li>• ① 불법 거래 또는 이상거래 탐지</li>
            <li>• ② 타인 명의 도용</li>
            <li>• ③ 그룹 해산, 장기 미사용</li>
            <li>• ④ 법령 또는 약관 위반</li>
            <li>• 이용자는 본인 확인 후 언제든 계좌 해지를 요청할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제9조 (면책조항)</h3>
          <ul className="space-y-1">
            <li>• 회사는 금융기관, 통신망 장애 등 외부 요인으로 인한 결제 실패에 대해 책임을 지지 않습니다.</li>
            <li>• 회사는 고의 또는 중대한 과실이 없는 한, 시스템 장애로 인한 지연, 중복결제 등에 대해 책임을 지지 않습니다.</li>
            <li>• 그룹 내 자금 분쟁, 배분 문제 등에 대해서는 개입하지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제10조 (분쟁해결)</h3>
          <ul className="space-y-1">
            <li>• 이용자는 서비스 이용과 관련한 민원을 고객센터 또는 금융감독원 전자민원센터를 통해 제기할 수 있습니다.</li>
            <li>• 본 약관과 관련된 분쟁의 관할법원은 서울중앙지방법원으로 합니다.</li>
          </ul>
        </section>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>시행일:</strong> 2025년 10월 24일<br/>
            <strong>담당 부서:</strong> ToGather 결제보안센터<br/>
            <strong>이메일:</strong> pay@togather.com
          </p>
        </div>
      </div>
    </TermsModal>
  );
}
