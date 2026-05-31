"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  cartKey?: string;
  name: string;
  price: number;
  originalPrice?: number;
  vipPrice?: number | null;
  isVipPrice?: boolean;
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
    vipPrice?: number;
    stock?: number;
  } | null;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    lineId: "",
    shippingMethod: "超商取貨",
    paymentMethod: "貨到付款",
    storeName: "",
    storeAddress: "",
    customerNote: "",
  });

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));

    const savedUser = localStorage.getItem("argent_user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setMember(parsedUser);

        setForm((prev) => ({
          ...prev,
          name: parsedUser?.name || "",
          phone: parsedUser?.phone || "",
          lineId:
            parsedUser?.line_user_id ||
            parsedUser?.line_id ||
            "",
        }));
      } catch {
        localStorage.removeItem("argent_user");
      }
    }
  }, []);

  const memberVipLevel =
    member?.vip_level || member?.level || "normal";

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const originalSubtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.originalPrice || item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  const vipSaved = originalSubtotal - subtotal;

  const shippingFee =
    form.shippingMethod === "超商取貨"
      ? 60
      : form.shippingMethod === "宅配"
      ? 130
      : 0;

  const total = subtotal + shippingFee;
  const depositAmount = Math.ceil(total / 2);

  function updateForm(key: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) {
      alert("請填寫姓名與電話");
      return;
    }

    if (cart.length === 0) {
      alert("購物車是空的");
      return;
    }

    if (form.shippingMethod === "超商取貨" && !form.storeName) {
      alert("請填寫超商門市名稱");
      return;
    }

    try {
      setLoading(true);

      for (const item of cart) {
        if (!item.selectedVariant?.name) continue;

        const { data: productData } = await supabase
          .from("products")
          .select("id, variants")
          .eq("id", item.id)
          .single();

        if (!productData) continue;

        const variants = Array.isArray(productData.variants)
          ? productData.variants
          : [];

        const currentVariant = variants.find(
          (variant: any) => variant.name === item.selectedVariant?.name
        );

        const currentStock = Number(currentVariant?.stock || 0);

        if (currentStock < Number(item.quantity || 1)) {
          alert(`${item.name}（${item.selectedVariant.name}）庫存不足`);
          setLoading(false);
          return;
        }
      }

      const orderId = crypto.randomUUID();
      const orderToken = crypto.randomUUID();

      const paymentNote =
        form.paymentMethod === "先付一半訂金"
          ? `付款方式：先付一半訂金｜訂金金額 NT$ ${depositAmount.toLocaleString()}`
          : `付款方式：${form.paymentMethod}`;

      const { error } = await supabase.from("orders").insert([
        {
          id: orderId,
          order_token: orderToken,

          customer_name: form.name,
          phone: form.phone,
          line_id:
            member?.line_user_id ||
            member?.line_id ||
            form.lineId,

          vip_level: memberVipLevel,

          shipping_method: `${form.shippingMethod}${
            form.shippingMethod === "超商取貨"
              ? `｜${form.storeName}${
                  form.storeAddress ? `｜${form.storeAddress}` : ""
                }`
              : ""
          }`,

          customer_note: `${paymentNote}${
            form.customerNote ? `\n${form.customerNote}` : ""
          }`,

          items: cart,
          total,
          status: "pending",
        },
      ]);

      if (error) {
        console.error(error);
        alert("訂單送出失敗");
        setLoading(false);
        return;
      }

      for (const item of cart) {
        if (!item.selectedVariant?.name) continue;

        const { data: productData } = await supabase
          .from("products")
          .select("id, variants")
          .eq("id", item.id)
          .single();

        if (!productData) continue;

        const variants = Array.isArray(productData.variants)
          ? productData.variants
          : [];

        const updatedVariants = variants.map((variant: any) => {
          if (variant.name === item.selectedVariant?.name) {
            return {
              ...variant,
              stock: Math.max(
                0,
                Number(variant.stock || 0) - Number(item.quantity || 1)
              ),
            };
          }

          return variant;
        });

        await supabase
          .from("products")
          .update({ variants: updatedVariants })
          .eq("id", item.id);
      }

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("storage"));
      window.location.href = `/orders/${orderId}?token=${orderToken}`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6 pb-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#a08060]">
            CHECKOUT
          </p>

          <h1 className="text-3xl font-bold text-[#4b4038]">
            填寫收件資料 ☁️
          </h1>

          {memberVipLevel !== "normal" && (
            <p className="mt-3 inline-flex rounded-full bg-[#fff2e5] px-4 py-2 text-sm font-medium text-[#b07255]">
              會員等級：{memberVipLevel.toUpperCase()}，已套用會員價
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-[#4b4038]">
              聯絡資料
            </h2>

            <div className="space-y-4">
              <input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="姓名 *"
                className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
              />

              <input
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="手機號碼 *"
                className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
              />

              <input
                value={form.lineId}
                onChange={(e) => updateForm("lineId", e.target.value)}
                placeholder="LINE ID / IG 帳號"
                className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
              />

              <select
                value={form.shippingMethod}
                onChange={(e) => updateForm("shippingMethod", e.target.value)}
                className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none"
              >
                <option value="超商取貨">超商取貨 $60</option>
                <option value="宅配">宅配 $130</option>
                <option value="面交">面交 $0</option>
              </select>

              <select
                value={form.paymentMethod}
                onChange={(e) => updateForm("paymentMethod", e.target.value)}
                className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none"
              >
                <option value="貨到付款">貨到付款</option>
                <option value="先付一半訂金">先付一半訂金</option>
                <option value="全額匯款">全額匯款</option>
              </select>

              {form.paymentMethod === "先付一半訂金" && (
                <div className="rounded-3xl bg-[#fff7ef] p-4 text-sm leading-7 text-[#9b6b4f]">
                  此筆訂單需先付一半訂金：
                  <br />
                  訂金金額 NT$ {depositAmount.toLocaleString()}
                  <br />
                  剩餘尾款可依約定方式付款。
                </div>
              )}

              {form.paymentMethod === "全額匯款" && (
                <div className="rounded-3xl bg-[#fff7ef] p-4 text-sm leading-7 text-[#9b6b4f]">
                  此筆訂單選擇全額匯款。
                  <br />
                  送出訂單後請依訂單頁付款資訊完成匯款。
                </div>
              )}

              {form.shippingMethod === "超商取貨" && (
                <>
                  <input
                    value={form.storeName}
                    onChange={(e) => updateForm("storeName", e.target.value)}
                    placeholder="超商門市名稱 *"
                    className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
                  />

                  <input
                    value={form.storeAddress}
                    onChange={(e) =>
                      updateForm("storeAddress", e.target.value)
                    }
                    placeholder="門市地址（可選）"
                    className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
                  />
                </>
              )}

              <textarea
                value={form.customerNote}
                onChange={(e) => updateForm("customerNote", e.target.value)}
                placeholder="訂單備註"
                className="min-h-[110px] w-full resize-none rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
              />
            </div>
          </section>

          <section className="h-fit rounded-[32px] bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="mb-5 text-lg font-semibold text-[#4b4038]">
              訂單明細
            </h2>

            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={item.cartKey || `${item.id}-${index}`}
                  className="rounded-3xl border border-[#f0e7dd] bg-[#fffdfb] p-4"
                >
                  <div className="flex gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f3eee8] text-xs text-gray-400">
                        無圖
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="text-xs tracking-[0.2em] text-[#b58b6b]">
                        {item.category || "Argent Nest"}
                      </p>

                      <p className="mt-1 text-sm font-semibold leading-6 text-[#4b4038]">
                        {item.name}
                      </p>

                      {item.selectedVariant?.name && (
                        <p className="mt-1 inline-flex rounded-full bg-[#f6efe7] px-3 py-1 text-xs text-[#9b6b4f]">
                          款式：{item.selectedVariant.name}
                        </p>
                      )}

                      {item.isVipPrice && (
                        <p className="mt-2 inline-flex rounded-full bg-[#fff2e5] px-3 py-1 text-xs font-medium text-[#b07255]">
                          VIP 價已套用
                        </p>
                      )}
                    </div>
                  </div>

                  {item.note && (
                    <p className="mt-3 rounded-2xl bg-[#f6f1ea] px-3 py-2 text-xs leading-5 text-[#6b5c50]">
                      顧客備註：{item.note}
                    </p>
                  )}

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#4b4038]">
                        NT$ {Number(item.price || 0).toLocaleString()} ×{" "}
                        {item.quantity}
                      </p>

                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="mt-1 text-xs text-gray-400 line-through">
                          原價 NT${" "}
                          {Number(item.originalPrice || 0).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <p className="text-sm font-bold text-[#4b4038]">
                      NT${" "}
                      {(
                        Number(item.price || 0) * Number(item.quantity || 1)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

              <div className="space-y-3 border-t border-[#f0e7dd] pt-5 text-sm">
                <div className="flex justify-between text-[#4b4038]">
                  <span>會員等級</span>
                  <span>{memberVipLevel.toUpperCase()}</span>
                </div>

                <div className="flex justify-between text-[#4b4038]">
                  <span>商品小計</span>
                  <span>NT$ {subtotal.toLocaleString()}</span>
                </div>

                {vipSaved > 0 && (
                  <div className="flex justify-between font-medium text-[#b07255]">
                    <span>VIP 優惠</span>
                    <span>- NT$ {vipSaved.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#4b4038]">
                  <span>運費</span>
                  <span>NT$ {shippingFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-[#4b4038]">
                  <span>付款方式</span>
                  <span>{form.paymentMethod}</span>
                </div>

                {form.paymentMethod === "先付一半訂金" && (
                  <div className="flex justify-between font-medium text-[#b07255]">
                    <span>需付訂金</span>
                    <span>NT$ {depositAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-[#f0e7dd] pt-4 text-lg font-semibold text-[#4b4038]">
                  <span>總金額</span>
                  <span>NT$ {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "送出中..." : "送出訂單 ☁️"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
