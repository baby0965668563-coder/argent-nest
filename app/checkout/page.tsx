"use client";

import { useEffect, useState } from "react";

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
  const [form, setForm] = useState({
    name: "",
    phone: "",
    lineId: "",
    shippingMethod: "超商取貨",
    note: "",
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  function updateForm(key: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleSubmit() {
    if (!form.name || !form.phone) {
      alert("請填寫姓名與電話");
      return;
    }

    if (cart.length === 0) {
      alert("購物車是空的");
      return;
    }

    const order = {
      customer: form,
      items: cart,
      total,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    console.log("order", order);
    alert("訂單資料已建立，下一步會接 Supabase 儲存訂單 ☁️");
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-semibold text-[#4b4038]">
          結帳資料
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_380px]">
          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#4b4038]">
              收件 / 聯絡資料
            </h2>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-[#6b5c50]">姓名 *</p>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
                  placeholder="請輸入姓名"
                />
              </div>

              <div>
                <p className="mb-2 text-sm text-[#6b5c50]">電話 *</p>
                <input
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
                  placeholder="請輸入電話"
                />
              </div>

              <div>
                <p className="mb-2 text-sm text-[#6b5c50]">LINE ID</p>
                <input
                  value={form.lineId}
                  onChange={(e) => updateForm("lineId", e.target.value)}
                  className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
                  placeholder="方便後續通知到貨"
                />
              </div>

              <div>
                <p className="mb-2 text-sm text-[#6b5c50]">取貨方式</p>
                <select
                  value={form.shippingMethod}
                  onChange={(e) =>
                    updateForm("shippingMethod", e.target.value)
                  }
                  className="w-full rounded-2xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="超商取貨">超商取貨</option>
                  <option value="宅配">宅配</option>
                  <option value="面交">面交</option>
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm text-[#6b5c50]">訂單備註</p>
                <textarea
                  value={form.note}
                  onChange={(e) => updateForm("note", e.target.value)}
                  className="min-h-[100px] w-full resize-none rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
                  placeholder="例如：希望一起出貨、可接受等貨、其他提醒"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#4b4038]">
              訂單明細
            </h2>

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

                    <div className="mt-2 flex justify-between text-sm text-[#4b4038]">
                      <span>
                        NT$ {item.price} × {item.quantity}
                      </span>
                      <span>
                        NT$ {Number(item.price || 0) * Number(item.quantity || 1)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-2 text-lg font-semibold text-[#4b4038]">
                  <span>小計</span>
                  <span>NT$ {total}</span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-4 w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white"
                >
                  送出訂單
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}