"use client";

import { useEffect, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number | string;
  image?: string;
  options?: Record<string, string>;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  function saveCart(nextCart: CartItem[]) {
    setCart(nextCart);
    localStorage.setItem("cart", JSON.stringify(nextCart));
  }

  function updateQuantity(index: number, quantity: number) {
    if (quantity < 1) return;

    const nextCart = [...cart];
    nextCart[index].quantity = quantity;
    saveCart(nextCart);
  }

  function removeItem(index: number) {
    const nextCart = cart.filter((_, i) => i !== index);
    saveCart(nextCart);
  }

  function clearCart() {
    if (!confirm("確定要清空購物車嗎？")) return;
    saveCart([]);
  }

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);

  const lineMessage = [
    "您好，我想下單以下商品：",
    "",
    ...cart.map((item, index) => {
      const optionText = item.options
        ? Object.entries(item.options)
            .map(([key, value]) => `${key}：${value}`)
            .join("、")
        : "";

      return [
        `${index + 1}. ${item.name}`,
        optionText ? `規格：${optionText}` : "",
        `單價：NT$ ${Number(item.price || 0).toLocaleString()}`,
        `數量：${item.quantity}`,
        `小計：NT$ ${(
          Number(item.price || 0) * Number(item.quantity || 1)
        ).toLocaleString()}`,
      ]
        .filter(Boolean)
        .join("\n");
    }),
    "",
    `總金額：NT$ ${total.toLocaleString()}`,
    "",
    "請協助確認是否可下單，謝謝 ☁️",
  ].join("\n");

  const lineUrl = `https://line.me/R/oaMessage/@929santn/?${encodeURIComponent(
    lineMessage
  )}`;

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-5 py-6 pb-28 text-[#2e2e2e]">
      <div className="mx-auto max-w-md">
        <div className="sticky top-0 z-20 mb-6 flex items-center justify-between border-b border-[#eaded4] bg-[#f8f5f0]/95 py-4 backdrop-blur">
          <a
            href="/"
            className="rounded-full border border-[#d8c5b0] px-4 py-2 text-sm text-[#6b5c50]"
          >
            返回
          </a>

          <h1 className="text-sm font-bold">購物車 ☁️</h1>

          <button
            onClick={clearCart}
            className="rounded-full border border-[#eaded4] px-4 py-2 text-sm text-[#8b6f5c]"
          >
            清空
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">🛒</p>

            <h2 className="mt-4 text-2xl font-bold">購物車是空的</h2>

            <p className="mt-3 text-sm leading-7 text-[#8b7b6e]">
              先去逛逛，把喜歡的小可愛加入購物車吧 ☁️
            </p>

            <a
              href="/"
              className="mt-8 block rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white"
            >
              回首頁逛逛
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="rounded-[2rem] bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f4eee8]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#b49a88]">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h2 className="line-clamp-2 text-sm font-bold leading-6">
                        {item.name}
                      </h2>

                      {item.options &&
                        Object.keys(item.options).length > 0 && (
                          <div className="mt-2 text-xs leading-6 text-[#8b7b6e]">
                            {Object.entries(item.options).map(([key, value]) => (
                              <p key={key}>
                                {key}：{value}
                              </p>
                            ))}
                          </div>
                        )}

                      <p className="mt-2 text-sm font-bold text-[#8b6f5c]">
                        NT$ {Number(item.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-[#eaded4]">
                      <button
                        onClick={() =>
                          updateQuantity(index, Number(item.quantity || 1) - 1)
                        }
                        className="px-4 py-2 text-lg"
                      >
                        −
                      </button>

                      <span className="min-w-8 text-center text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(index, Number(item.quantity || 1) + 1)
                        }
                        className="px-4 py-2 text-lg"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(index)}
                      className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-500"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#8b7b6e]">商品總金額</p>

                <p className="text-2xl font-bold text-[#2e2e2e]">
                  NT$ {total.toLocaleString()}
                </p>
              </div>

              <p className="mt-3 text-xs leading-6 text-[#8b7b6e]">
                實際運費、是否有現貨、預購時間會由闆娘確認後回覆 ☁️
              </p>
            </div>

            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block rounded-full bg-[#06C755] py-4 text-center text-sm font-bold text-white"
            >
              用 LINE 送出訂單 ☁️
            </a>

            <a
              href="/"
              className="mt-3 block rounded-full border border-[#d8c5b0] bg-white py-4 text-center text-sm font-medium text-[#6b5c50]"
            >
              繼續逛逛
            </a>
          </>
        )}
      </div>
    </main>
  );
}