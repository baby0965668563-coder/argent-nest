"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const count = cart.reduce(
      (sum: number, item: any) => sum + Number(item.quantity || 1),
      0
    );

    setCartCount(count);
  }

  useEffect(() => {
    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("focus", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("focus", updateCartCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eadfd3] bg-[#faf7f2]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-left"
        >
          <p className="text-lg font-semibold tracking-wide text-[#4b4038]">
            Argent Nest
          </p>
          <p className="text-xs text-[#9b8b7c]">
            healing select shop
          </p>
        </button>

        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="relative rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50] shadow-sm"
        >
          🛒 購物車

          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2e2e2e] px-2 text-xs text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}