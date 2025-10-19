"use client";

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { getUserId } from "@/utils/token";

interface GroupIdCtx {
  groupId: string;
  setGroupId: (t: string) => void;
}

const GroupIdContext = createContext<GroupIdCtx | undefined>(undefined);

export function GroupIdProvider({ children }: { children: ReactNode }) {
  const [groupId, setGroupId] = useState("");

  // 새로고침 시 localStorage에서 그룹 ID 복원
  useEffect(() => {
    // console.log("🔄 GroupIdProvider - useEffect 실행됨");
    
    const tryRestoreGroupId = () => {
      const userId = getUserId();
      // console.log("🔄 GroupIdProvider - getUserId 결과:", userId);
      
      if (userId) {
        // localStorage에서 현재 그룹 ID 확인
        const key = `currentGroupId_${userId}`;
        const storedGroupId = localStorage.getItem(key);
        // console.log("🔄 GroupIdProvider - localStorage 키:", key);
        // console.log("🔄 GroupIdProvider - localStorage에서 읽어온 그룹 ID:", storedGroupId);
        
        if (storedGroupId) {
          // console.log("🔄 GroupIdProvider - localStorage에서 그룹 ID 복원:", storedGroupId);
          setGroupId(storedGroupId);
        } else {
          // console.log("🔄 GroupIdProvider - localStorage에 저장된 그룹 ID가 없음");
        }
        return true; // 성공적으로 복원됨
      } else {
        // console.log("🔄 GroupIdProvider - userId가 없어서 복원할 수 없음");
        return false; // 복원 실패
      }
    };
    
    // 즉시 시도
    if (!tryRestoreGroupId()) {
      // userId가 없으면 잠시 후 다시 시도 (토큰이 로드될 때까지 기다림)
      // console.log("🔄 GroupIdProvider - 토큰 로드를 기다린 후 재시도");
      const retryInterval = setInterval(() => {
        if (tryRestoreGroupId()) {
          clearInterval(retryInterval);
        }
      }, 100); // 100ms마다 재시도
      
      // 5초 후에는 재시도를 중단
      setTimeout(() => {
        clearInterval(retryInterval);
        // console.log("🔄 GroupIdProvider - 재시도 중단 (5초 경과)");
      }, 5000);
    }
  }, []);

  // setGroupId 함수를 확장하여 localStorage에도 저장
  const handleSetGroupId = (newGroupId: string) => {
    // console.log("💾 GroupIdProvider - setGroupId 호출:", newGroupId);
    setGroupId(newGroupId);
    
    const userId = getUserId();
    if (userId) {
      // localStorage에도 저장
      localStorage.setItem(`currentGroupId_${userId}`, newGroupId);
      // console.log("💾 GroupIdProvider - localStorage에 그룹 ID 저장 완료");
    }
  };

  return (
    <GroupIdContext.Provider value={{ groupId, setGroupId: handleSetGroupId }}>
      {children}
    </GroupIdContext.Provider>
  );
}
//사용법법
//const { groupId, setGroupId } = useGroupId();

export function useGroupId() {
  const ctx = useContext(GroupIdContext);
  if (!ctx) throw new Error("useGroupId must be used within <GroupIdProvider>");
  return ctx;
}
