"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  cartKey?: string;

  name: string;

  price: number;

  payment_type?: string | null;

  originalPrice?: number;

  image?: string;

  quantity: number;

  options?: Record<string, string>;

  optionText?: string;

  note?: string;

  productNote?: string;

  category?: string;

  selectedVariant?: {
    name: string;
    price: number;
    stock?: number;
  } | null;

};

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    setCart(savedCart);
  }, []);

  function updateCart(newCart: CartItem[]) {
    setCart(newCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    window.dispatchEvent(new Event("storage"));
  }

  function removeItem(index: number) {
    const newCart = cart.filter(
      (_, i) => i !== index
    );

    updateCart(newCart);
  }

  function changeQuantity(
    index: number,
    amount: number
  ) {
    const newCart = [...cart];

    newCart[index].quantity =
      Number(
        newCart[index].quantity || 1
      ) + amount;

    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }

    updateCart(newCart);
  }

  function clearCart() {
    const ok = confirm(
      "確定清空購物車嗎？"
    );

    if (!ok) return;

    updateCart([]);
  }

  function getPaymentTypeLabel(type?: string | null) {
    if (type === "bank_only") return "匯款限定";
    if (type === "deposit_only") return "50%訂金限定";
    if (type === "cod_only") return "貨到付款限定";
    return "全部付款方式";
  }

  function getPaymentTypeStyle(type?: string | null) {
    if (type === "bank_only") return "bg-[#eef3ff] text-[#4f6596]";
    if (type === "deposit_only") return "bg-[#fff2e5] text-[#b07255]";
    if (type === "cod_only") return "bg-[#e9f7ef] text-[#2e7d32]";
    return "bg-[#f6f1ea] text-[#6b5c50]";
  }

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6 pb-40">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#a08060]">
              CART
            </p>

            <h1 className="text-3xl font-bold text-[#4b4038]">
              購物車 ☁️
            </h1>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
            >
              清空
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[32px] bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">
              ☁️
            </div>

            <p className="mt-5 text-lg font-medium text-[#4b4038]">
              購物車目前是空的
            </p>

            <p className="mt-2 text-sm text-[#8c7b70]">
              去挑一些療癒小東西吧～
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="mt-6 rounded-full bg-[#2e2e2e] px-8 py-3 text-sm text-white"
            >
              返回首頁
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* 左側商品 */}
            <div className="space-y-4">
              {cart.map(
                (item, index) => (
                  <div
                    key={
                      item.cartKey ||
                      `${item.id}-${index}`
                    }
                    className="overflow-hidden rounded-[32px] bg-white shadow-sm"
                  >
                    <div className="flex gap-4 p-4">
                      {/* 圖片 */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-28 w-28 rounded-3xl object-cover"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[#f3eee8] text-sm text-gray-400">
                          無圖
                        </div>
                      )}

                      {/* 資訊 */}
                      <div className="flex-1">
                        <p className="text-xs tracking-[0.2em] text-[#b58b6b]">
                          {item.category ||
                            "Argent Nest"}
                        </p>

                        <h2 className="mt-1 text-[15px] font-semibold leading-7 text-[#4b4038]">
                          {item.name}
                        </h2>

                        {/* 款式 */}
                        {item.selectedVariant
                          ?.name && (
                          <div className="mt-2 inline-flex rounded-full bg-[#f6efe7] px-3 py-1 text-xs text-[#9b6b4f]">
                            款式：
                            {
                              item
                                .selectedVariant
                                .name
                            }
                          </div>
                        )}

                        {item.payment_type && item.payment_type !== "all" && (
                          <div
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPaymentTypeStyle(
                              item.payment_type
                            )}`}
                          >
                            {getPaymentTypeLabel(item.payment_type)}
                          </div>
                        )}

                        {/* 規格 */}
                        {item.options &&
                          Object.entries(
                            item.options
                          )
                            .filter(
                              ([key]) =>
                                key !==
                                "款式"
                            )
                            .map(
                              ([
                                key,
                                value,
                              ]) => (
                                <p
                                  key={
                                    key
                                  }
                                  className="mt-2 text-sm text-[#8c7b70]"
                                >
                                  {key}
                                  ：
                                  {
                                    value
                                  }
                                </p>
                              )
                            )}

                        {/* 商品備註 */}
                        {item.productNote && (
                          <div className="mt-3 rounded-2xl bg-[#fff7ef] px-3 py-2 text-sm leading-6 text-[#9b6b4f]">
                            商品備註：
                            {
                              item.productNote
                            }
                          </div>
                        )}

                        {/* 顧客備註 */}
                        {item.note && (
                          <div className="mt-3 rounded-2xl bg-[#f6f1ea] px-3 py-2 text-sm leading-6 text-[#6b5c50]">
                            顧客備註：
                            {
                              item.note
                            }
                          </div>
                        )}

                        {/* 價格 */}
                        <div className="mt-4">
                          <p className="text-lg font-bold text-[#4b4038]">
                            NT$
                            {" "}
                            {Number(
                              item.price ||
                                0
                            ).toLocaleString()}
                          </p>

                        </div>
                      </div>
                    </div>

                    {/* 下方控制 */}
                    <div className="flex items-center justify-between border-t border-[#f5eee7] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              index,
                              -1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c5b0] text-[#6b5c50]"
                        >
                          −
                        </button>

                        <span className="min-w-[20px] text-center text-sm font-medium text-[#4b4038]">
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              index,
                              1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c5b0] text-[#6b5c50]"
                        >
                          ＋
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            index
                          )
                        }
                        className="text-sm text-gray-400 underline"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* 右側結帳 */}
            <div className="h-fit rounded-[32px] bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <p className="mb-5 text-xl font-semibold text-[#4b4038]">
                訂單摘要
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-[#6b5c50]">
                  <span>商品金額</span>

                  <span>
                    NT$
                    {" "}
                    {total.toLocaleString()}
                  </span>
                </div>

              </div>

              <div className="mt-5 border-t border-[#f0e7dd] pt-5">
                <div className="flex items-center justify-between text-lg font-semibold text-[#4b4038]">
                  <span>小計</span>

                  <span>
                    NT$
                    {" "}
                    {total.toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-6 text-[#8c7b70]">
                  運費將於下一步結帳時計算 ☁️
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/checkout"
                  )
                }
                className="mt-6 w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                前往結帳
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/")
                }
                className="mt-3 w-full rounded-full border border-[#d8c5b0] bg-white py-3 text-sm text-[#6b5c50]"
              >
                繼續逛逛
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
