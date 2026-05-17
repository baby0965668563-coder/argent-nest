"use client";

import { useEffect, useState } from "react";

export default function MobileBottomNav() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function updateCartCount() {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const total = cart.reduce(
        (sum: number, item: any) =>
          sum + Number(item.quantity || 1),
        0
      );

      setCartCount(total);
    }

    updateCartCount();

    window.addEventListener("storage", updateCartCount);

    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#eaded4] bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        <a
          href="/"
          className="flex flex-col items-center justify-center py-3 text-[#6b5c50]"
        >
          <span className="text-lg">🏠</span>
          <span className="mt-1 text-[10px]">首頁</span>
        </a>

        <a
          href="/#categories"
          className="flex flex-col items-center justify-center py-3 text-[#6b5c50]"
        >
          <span className="text-lg">☁️</span>
          <span className="mt-1 text-[10px]">分類</span>
        </a>

        <a
          href="/cart"
          className="relative flex flex-col items-center justify-center py-3 text-[#6b5c50]"
        >
          <span className="text-lg">🛒</span>

          {cartCount > 0 && (
            <div className="absolute right-[30%] top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2e2e2e] px-1 text-[10px] text-white">
              {cartCount}
            </div>
          )}

          <span className="mt-1 text-[10px]">購物車</span>
        </a>

        <a
          href="https://line.me/R/ti/p/@929santn"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 text-[#6b5c50]"
        >
          <span className="text-lg">💬</span>
          <span className="mt-1 text-[10px]">LINE</span>
        </a>
      </div>
    </div>
  );
}