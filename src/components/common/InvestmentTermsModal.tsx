"use client";

import TermsModal from "./TermsModal";

interface InvestmentTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InvestmentTermsModal({ isOpen, onClose }: InvestmentTermsModalProps) {
  return (
    <TermsModal isOpen={isOpen} onClose={onClose} title="투자계좌 이용약관">
      <div className="space-y-3 text-xs leading-tight">
        <section>
          <h3 className="font-bold text-xs mb-1">제1조 (목적)</h3>
          <p>
            본 약관은 ToGather 주식회사(이하 "회사")가 제공하는 CMA(종합자산관리계좌) 서비스를 이용함에 있어, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제2조 (계좌의 개설 및 이용)</h3>
          <ul className="space-y-1">
            <li>• 이용자는 본 약관 및 관련 법령에 따라 본인 명의로만 투자계좌를 개설할 수 있습니다.</li>
            <li>• 회사는 이용자의 본인 확인 및 신용조회 절차를 거쳐 계좌 개설을 승인합니다.</li>
            <li>• 이용자는 회사가 제공하는 모바일 또는 웹 서비스 내에서 투자계좌의 조회, 입출금, 금융상품 거래 등의 기능을 이용할 수 있습니다.</li>
            <li>• 투자계좌는 예치금, 투자금, 배당금 및 각종 수익금의 수납·지급 계좌로 사용됩니다.</li>
            <li>• 이용자는 본 계좌를 주식, 채권, 펀드 등 회사가 제공하는 금융상품 거래에 사용할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제3조 (계좌의 성격)</h3>
          <ul className="space-y-1">
            <li>• CMA 계좌는 「자본시장과 금융투자업에 관한 법률」에 따른 종합자산관리계좌입니다.</li>
            <li>• 이용자가 입금한 금전은 회사 명의로 예탁결제원에 신탁되어 운용됩니다.</li>
            <li>• 회사는 고객의 금전을 자기 재산과 구분하여 관리하며, 고객예탁금은 예탁결제원 등 법령이 정한 기관에 예치합니다.</li>
            <li>• 이용자는 해당 계좌의 예치금에 대하여 일정한 이자 또는 수익을 받을 수 있습니다.</li>
            <li>• CMA 계좌는 결제계좌의 기능을 겸하며, 투자계좌에서 페이계좌 또는 외부계좌로 이체할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제4조 (투자위험에 대한 고지)</h3>
          <ul className="space-y-1">
            <li>• 금융투자상품은 원금 손실이 발생할 수 있으며, 예금자보호법에 따라 보호되지 않습니다.</li>
            <li>• 이용자는 회사가 제공하는 각 상품의 투자설명서를 충분히 숙지하고 스스로 판단하여 거래를 결정하여야 합니다.</li>
            <li>• 회사는 투자 권유를 하지 않으며, 모든 투자 판단과 그 결과에 대한 책임은 이용자 본인에게 있습니다.</li>
            <li>• 회사는 투자결과 또는 시장 변동에 따른 손실에 대해 책임을 지지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제5조 (예금 및 출금)</h3>
          <ul className="space-y-1">
            <li>• 이용자는 본인 명의의 계좌를 통해 투자계좌로 입금할 수 있습니다.</li>
            <li>• 출금은 이용자 본인 확인을 거친 후에만 가능하며, 제3자의 대리 인출은 허용되지 않습니다.</li>
            <li>• 회사는 거래의 안전을 위해 1일 이체한도, 인증수단, 추가 본인확인 절차를 설정할 수 있습니다.</li>
            <li>• 부정거래 또는 이상거래가 의심되는 경우 회사는 출금 및 거래를 일시 중단할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제6조 (금융상품 거래)</h3>
          <ul className="space-y-1">
            <li>• 이용자는 투자계좌를 통하여 주식, 채권, 펀드 등 금융상품을 매매할 수 있습니다.</li>
            <li>• 각 금융상품의 거래조건, 수수료, 세금 등은 별도의 상품설명서 및 고시사항에 따릅니다.</li>
            <li>• 거래 체결 후 발생하는 손익은 투자계좌에 반영됩니다.</li>
            <li>• 회사는 거래 체결내역, 정산내역, 잔고정보를 전자적 방법으로 이용자에게 제공합니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제7조 (수수료 및 세금)</h3>
          <ul className="space-y-1">
            <li>• 회사는 금융상품 거래 시 수수료를 부과할 수 있으며, 구체적인 요율은 서비스 화면 또는 상품설명서에 명시합니다.</li>
            <li>• 이용자는 관련 세법에 따른 증권거래세, 양도소득세 등을 부담합니다.</li>
            <li>• 회사는 세금 원천징수 대상에 해당하는 경우 관련 법령에 따라 세금을 원천징수할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제8조 (개인정보 및 신용정보의 처리)</h3>
          <ul className="space-y-1">
            <li>• 회사는 계좌 개설 및 거래 수행을 위해 이용자의 개인정보와 신용정보를 수집·이용할 수 있습니다.</li>
            <li>• 수집된 정보는 「개인정보보호법」 및 「신용정보의 이용 및 보호에 관한 법률」에 따라 관리됩니다.</li>
            <li>• 이용자는 동의를 철회할 수 있으나, 이 경우 서비스 제공이 제한될 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제9조 (서비스의 변경 및 중단)</h3>
          <ul className="space-y-1">
            <li>• 회사는 시스템 점검, 외부 금융기관의 정책 변경, 법령 개정 등 불가피한 사유로 서비스 제공을 일시 중단할 수 있습니다.</li>
            <li>• 회사는 서비스 중단 또는 변경 시 이용자에게 사전 고지합니다.</li>
            <li>• 회사는 불가항력적 사유로 인한 서비스 장애에 대해 책임을 지지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제10조 (책임 및 면책)</h3>
          <ul className="space-y-1">
            <li>• 회사는 고의 또는 중대한 과실이 없는 한 다음의 사유로 인한 손해에 대해 책임을 지지 않습니다.</li>
            <li>• ① 천재지변, 정전, 시스템 장애, 통신망 두절</li>
            <li>• ② 금융기관, 예탁결제원 등 제3자의 귀책사유</li>
            <li>• ③ 이용자의 부주의, 비밀번호 관리 소홀</li>
            <li>• 이용자는 자신의 계좌 비밀번호, 인증수단 등을 철저히 관리해야 하며, 제3자에게 유출되어 발생한 손해는 이용자 본인의 책임입니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제11조 (이용제한 및 해지)</h3>
          <ul className="space-y-1">
            <li>• 다음 각 호에 해당하는 경우 회사는 계좌 이용을 정지하거나 해지할 수 있습니다.</li>
            <li>• ① 타인 명의 도용, 허위정보 제공</li>
            <li>• ② 법령 또는 본 약관 위반</li>
            <li>• ③ 자금세탁방지(AML) 관련 의심 거래 발생</li>
            <li>• 이용자는 회사의 고객센터 또는 모바일 앱을 통해 계좌 해지를 요청할 수 있으며, 회사는 본인 확인 후 즉시 처리합니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xs mb-1">제12조 (분쟁해결 및 관할)</h3>
          <ul className="space-y-1">
            <li>• 회사는 서비스 이용과 관련하여 발생한 분쟁을 신속하게 해결하기 위해 노력합니다.</li>
            <li>• 이용자는 금융감독원 전자민원센터 등을 통해 분쟁조정을 신청할 수 있습니다.</li>
            <li>• 본 약관과 관련된 분쟁의 관할 법원은 서울중앙지방법원으로 합니다.</li>
          </ul>
        </section>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>시행일:</strong> 2025년 10월 24일<br/>
            <strong>담당 부서:</strong> ToGather 고객지원센터<br/>
            <strong>이메일:</strong> support@togather.com
          </p>
        </div>
      </div>
    </TermsModal>
  );
}
