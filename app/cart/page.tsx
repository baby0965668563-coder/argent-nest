"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  options?: Record<string, string>;
  note?: string;
  productNote?: string;
  category?: string;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  function updateCart(newCart: CartItem[]) {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  function removeItem(index: number) {
    const newCart = cart.filter((_, i) => i !== index);
    updateCart(newCart);
  }

  function changeQuantity(index: number, amount: number) {
    const newCart = [...cart];

    newCart[index].quantity =
      Number(newCart[index].quantity || 1) + amount;

    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }

    updateCart(newCart);
  }

  function clearCart() {
    updateCart([]);
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-semibold text-[#4b4038]">
          購物車
        </h1>

        {cart.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            購物車目前是空的 ☁️
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="rounded-3xl bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-24 w-24 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
                        無圖
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="text-xs text-gray-400">
                        {item.category || "Argent Nest Select"}
                      </p>

                      <h2 className="mt-1 font-semibold leading-relaxed text-[#4b4038]">
                        {item.name}
                      </h2>

                      {item.options &&
                        Object.entries(item.options).map(([key, value]) => (
                          <p key={key} className="mt-1 text-sm text-gray-500">
                            {key}：{value}
                          </p>
                        ))}

                      {item.productNote && (
                        <p className="mt-2 rounded-2xl bg-[#fff7ef] px-3 py-2 text-sm text-[#9b6b4f]">
                          商品備註：{item.productNote}
                        </p>
                      )}

                      {item.note && (
                        <p className="mt-2 rounded-2xl bg-[#f6f1ea] px-3 py-2 text-sm text-[#6b5c50]">
                          顧客備註：{item.note}
                        </p>
                      )}

                      <p className="mt-2 font-semibold text-[#4b4038]">
                        NT$ {item.price}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => changeQuantity(index, -1)}
                        className="h-8 w-8 rounded-full border border-[#d8c5b0] text-[#6b5c50]"
                      >
                        -
                      </button>

                      <span className="text-sm text-[#4b4038]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => changeQuantity(index, 1)}
                        className="h-8 w-8 rounded-full border border-[#d8c5b0] text-[#6b5c50]"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-sm text-gray-400 underline"
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-lg font-semibold text-[#4b4038]">
                <span>小計</span>
                <span>NT$ {total}</span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="mt-5 w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white"
              >
                前往結帳
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="mt-3 w-full rounded-full border border-[#d8c5b0] bg-white py-3 text-sm text-[#6b5c50]"
              >
                清空購物車
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}