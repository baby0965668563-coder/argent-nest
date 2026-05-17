"use client";

export default function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8ddd4] bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        <a
          href="/"
          className="flex flex-col items-center justify-center py-3 text-[#6b5c50]"
        >
          <span className="text-lg">🏠</span>
          <span className="mt-1 text-[10px]">首頁</span>
        </a>

        <a
          href="#categories"
          className="flex flex-col items-center justify-center py-3 text-[#6b5c50]"
        >
          <span className="text-lg">🧸</span>
          <span className="mt-1 text-[10px]">分類</span>
        </a>

        <a
          href="#featured"
          className="flex flex-col items-center justify-center py-3 text-[#6b5c50]"
        >
          <span className="text-lg">🔥</span>
          <span className="mt-1 text-[10px]">熱賣</span>
        </a>

        <a
          href="https://line.me/R/ti/p/@929santn"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 text-[#06C755]"
        >
          <span className="text-lg">💬</span>
          <span className="mt-1 text-[10px]">LINE</span>
        </a>
      </div>
    </div>
  );
}