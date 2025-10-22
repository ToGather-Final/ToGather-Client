"use client";

import { baseUrl } from "@/constants/baseUrl";
import { getUserInvestmentAccount } from "@/services/group/group";
import { useState, useEffect } from "react";
import useSWR from "swr";

export default function Test1() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("togather_user_id");
      setUserId(id);
    }
  }, []);

  const {
    data: accountData,
    error: accountError,
    isLoading: accountIsLoading,
  } = useSWR(
    userId ? `${baseUrl}/trading/internal/accounts/user/${userId}` : null,
    getUserInvestmentAccount
  );

  if (!userId) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            사용자 투자 계좌 조회 테스트
          </h1>
          <p className="text-red-600">
            사용자 ID를 찾을 수 없습니다. 로그인이 필요합니다.
          </p>
        </div>
      </div>
    );
  }

  if (accountIsLoading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            사용자 투자 계좌 조회 테스트
          </h1>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (accountError) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            사용자 투자 계좌 조회 테스트
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              에러 발생
            </h2>
            <p className="text-red-600">
              {accountError.message || "계좌 조회 실패"}
            </p>
            {accountError.code && (
              <p className="text-sm text-red-500 mt-2">
                코드: {accountError.code}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          사용자 투자 계좌 조회 테스트
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-3">계좌 정보</h2>
          {accountData && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">계좌 ID:</span>
                <span className="font-mono">
                  {accountData.investmentAccountId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">사용자 ID:</span>
                <span className="font-mono">{accountData.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">계좌번호:</span>
                <span className="font-mono font-bold">
                  {accountData.accountNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">생성일:</span>
                <span>
                  {new Date(accountData.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Raw Data:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(accountData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
