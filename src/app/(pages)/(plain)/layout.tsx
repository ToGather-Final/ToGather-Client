export default function PlainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 로그인/회원가입/그룹 생성 등 (상단/하단바 없이 풀 화면)
    <div className="h-screen flex justify-center bg-stone-50 p-safe">
      <div className="w-full max-w-[var(--app-max-w)] bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <main className="h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
