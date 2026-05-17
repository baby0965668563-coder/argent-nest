"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  options?: Record<string, string>;
  note?: string;
  productNote?: string;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    lineId: "",
    shippingMethod: "超商取貨",
    storeName: "",
    storeAddress: "",
    customerNote: "",
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const shippingFee =
    form.shippingMethod === "超商取貨"
      ? 60
      : form.shippingMethod === "宅配"
      ? 130
      : 0;

  const total = subtotal + shippingFee;

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
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

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: form.name,
            phone: form.phone,
            line_id: form.lineId,
            shipping_method: form.shippingMethod,
            customer_note: form.customerNote,
            items: cart,
            total,
            status: "pending",
          },
        ])
        .select("id")
        .single();

      if (error) {
        console.error(error);
        alert("訂單送出失敗，請檢查 Supabase 欄位");
        return;
      }

      localStorage.removeItem("cart");

      window.location.href = `/order-success?id=${data.id}`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-semibold text-[#4b4038]">
          填寫收件資料
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_380px]">
          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#4b4038]">聯絡資料</h2>

            <div className="space-y-4">
              <input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="姓名 *"
                className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
              />

              <input
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="手機號碼 *"
                className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
              />

              <input
                value={form.lineId}
                onChange={(e) => updateForm("lineId", e.target.value)}
                placeholder="LINE ID（方便通知）"
                className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
              />

              <select
                value={form.shippingMethod}
                onChange={(e) => updateForm("shippingMethod", e.target.value)}
                className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="超商取貨">超商取貨 $60</option>
                <option value="宅配">宅配 $130</option>
                <option value="面交">面交 $0</option>
              </select>

              {form.shippingMethod === "超商取貨" && (
                <>
                  <input
                    value={form.storeName}
                    onChange={(e) => updateForm("storeName", e.target.value)}
                    placeholder="超商門市名稱 *"
                    className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
                  />

                  <input
                    value={form.storeAddress}
                    onChange={(e) =>
                      updateForm("storeAddress", e.target.value)
                    }
                    placeholder="門市地址（可選）"
                    className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
                  />
                </>
              )}

              <textarea
                value={form.customerNote}
                onChange={(e) => updateForm("customerNote", e.target.value)}
                placeholder="訂單備註，例如：想一起出貨、送禮用"
                className="min-h-[100px] w-full resize-none rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#4b4038]">訂單明細</h2>

            {cart.length === 0 ? (
              <p className="text-sm text-gray-500">購物車目前是空的</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="border-b pb-4">
                    <p className="font-medium text-[#4b4038]">{item.name}</p>

                    {item.options &&
                      Object.entries(item.options).map(([key, value]) => (
                        <p key={key} className="mt-1 text-sm text-gray-500">
                          {key}：{value}
                        </p>
                      ))}

                    {item.productNote && (
                      <p className="mt-1 text-sm text-[#9b6b4f]">
                        商品備註：{item.productNote}
                      </p>
                    )}

                    {item.note && (
                      <p className="mt-1 text-sm text-[#6b5c50]">
                        顧客備註：{item.note}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-[#4b4038]">
                      NT$ {item.price} × {item.quantity}
                    </p>
                  </div>
                ))}

                <div className="space-y-2 pt-2 text-sm text-[#4b4038]">
                  <div className="flex justify-between">
                    <span>商品小計</span>
                    <span>NT$ {subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>運費</span>
                    <span>NT$ {shippingFee}</span>
                  </div>

                  <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                    <span>總金額</span>
                    <span>NT$ {total}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-4 w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white disabled:opacity-50"
                >
                  {loading ? "送出中..." : "送出訂單 ☁️"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}