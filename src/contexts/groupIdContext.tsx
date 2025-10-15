"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface GroupIdCtx {
  groupId: string;
  setGroupId: (t: string) => void;
}

const GroupIdContext = createContext<GroupIdCtx | undefined>(undefined);

export function GroupIdProvider({ children }: { children: ReactNode }) {
  const [groupId, setGroupId] = useState("");
  return (
    <GroupIdContext.Provider value={{ groupId, setGroupId }}>
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
