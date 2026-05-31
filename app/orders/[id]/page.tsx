"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  vipPrice?: number | null;
  isVipPrice?: boolean;
  image?: string;
  quantity: number;
  options?: Record<string, string>;
  note?: string;
  productNote?: string;
  selectedVariant?: {
    name: string;
    price: number;
    vipPrice?: number;
    stock?: number;
  } | null;
};

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  line_id?: string;
  shipping_method?: string;
  customer_note?: string;
  items: CartItem[];
  total: number;
  status: string;
  order_token?: string;
  vip_level?: string;
};

const statusText: Record<string, string> = {
  pending: "待確認",
  deposit_pending: "待收訂金",
  deposit_paid: "已收訂金",
  paid: "已付款",
  cod: "貨到付款",
  ordered: "已訂貨",
  arrived: "已到貨",
  shipped: "已出貨",
  done: "已完成",
  cancelled: "已取消",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const orderId = String(params?.id || "");
    const token = searchParams.get("token") || "";

    if (!orderId || !token) {
      setLoading(false);
      return;
    }

    fetchOrder(orderId, token);
  }, [params, searchParams]);

  async function fetchOrder(orderId: string, token: string) {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("order_token", token)
      .single();

    if (error || !data) {
      console.error(error);
      setOrder(null);
      setLoading(false);
      return;
    }

    setOrder(data);
    setLoading(false);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getVipSaved(items: CartItem[]) {
    return items.reduce((sum, item) => {
      const original = Number(item.originalPrice || item.price || 0);
      const current = Number(item.price || 0);
      const qty = Number(item.quantity || 1);

      return sum + Math.max(0, original - current) * qty;
    }, 0);
  }

  function getPaymentMethod(note?: string) {
    if (!note) return "未標示";
    if (note.includes("先付一半訂金")) return "先付一半訂金";
    if (note.includes("全額匯款")) return "全額匯款";
    if (note.includes("貨到付款")) return "貨到付款";
    return "未標示";
  }

  function getDepositAmount(note?: string) {
    if (!note) return "";
    const match = note.match(/訂金金額 NT\$ ([\d,]+)/);
    return match?.[1] || "";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf7f2] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
          訂單載入中...
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#faf7f2] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#4b4038]">
            找不到此訂單，或查詢連結已失效 ☁️
          </p>

          <p className="mt-3 text-sm leading-7 text-[#8c7b70]">
            請使用下單成功頁提供的完整訂單連結查看。
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 rounded-full bg-[#2e2e2e] px-6 py-3 text-sm text-white"
          >
            回首頁
          </button>
        </div>
      </main>
    );
  }

  const vipLevel = order.vip_level || "normal";
  const vipSaved = getVipSaved(order.items || []);
  const paymentMethod = getPaymentMethod(order.customer_note);
  const depositAmount = getDepositAmount(order.customer_note);

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="mb-6 text-center">
            <div className="text-5xl">☁️</div>

            <h1 className="mt-4 text-3xl font-bold text-[#4b4038]">
              訂單查詢
            </h1>

            <p className="mt-3 text-sm text-[#8c7b70]">
              感謝你的訂購 🤍
            </p>
          </div>

          <div className="rounded-3xl bg-[#f8f3ec] p-5">
            <div className="space-y-3 text-sm text-[#5c5148]">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">訂單編號</span>
                <span className="break-all text-right">{order.id}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">訂單時間</span>
                <span>{formatDate(order.created_at)}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">訂單狀態</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs text-[#9b6b4f]">
                  {statusText[order.status] || order.status}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">會員等級</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    vipLevel === "normal"
                      ? "bg-white text-[#8c7b70]"
                      : "bg-[#fff2e5] text-[#b07255]"
                  }`}
                >
                  {vipLevel.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">付款方式</span>
                <span>{paymentMethod}</span>
              </div>

              {depositAmount && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">訂金金額</span>
                  <span className="font-semibold text-[#b07255]">
                    NT$ {depositAmount}
                  </span>
                </div>
              )}

              {vipSaved > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">VIP 優惠</span>
                  <span className="font-semibold text-[#b07255]">
                    - NT$ {vipSaved.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">姓名</span>
                <span>{order.customer_name}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">電話</span>
                <span>{order.phone}</span>
              </div>

              {order.line_id && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">LINE ID</span>
                  <span>{order.line_id}</span>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">取貨方式</span>
                <span>{order.shipping_method || "未填寫"}</span>
              </div>

              {order.customer_note && (
                <div className="pt-2">
                  <p className="mb-2 text-gray-500">訂單備註</p>
                  <div className="whitespace-pre-line rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-[#5c5148]">
                    {order.customer_note}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-[#4b4038]">
              商品明細
            </h2>

            <div className="space-y-4">
              {(order.items || []).map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="rounded-3xl border border-[#efe5d9] bg-[#fffdfa] p-4"
                >
                  <div className="flex gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-24 w-24 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#f1ebe4] text-xs text-gray-400">
                        無圖片
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold leading-relaxed text-[#4b4038]">
                        {item.name}
                      </h3>

                      {item.selectedVariant?.name && (
                        <p className="mt-1 text-sm text-[#9b6b4f]">
                          款式：{item.selectedVariant.name}
                        </p>
                      )}

                      {item.options &&
                        Object.entries(item.options).map(([key, value]) => (
                          <p
                            key={key}
                            className="mt-1 text-sm text-[#7a6a5d]"
                          >
                            {key}：{value}
                          </p>
                        ))}

                      {item.productNote && (
                        <p className="mt-2 rounded-2xl bg-[#fff4e8] px-3 py-2 text-sm text-[#9b6b4f]">
                          商品備註：{item.productNote}
                        </p>
                      )}

                      {item.note && (
                        <p className="mt-2 rounded-2xl bg-[#f6f1ea] px-3 py-2 text-sm text-[#6b5c50]">
                          顧客備註：{item.note}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between text-sm text-[#4b4038]">
                        <div>
                          <p>
                            NT$ {Number(item.price || 0).toLocaleString()} ×{" "}
                            {item.quantity}
                          </p>

                          {item.isVipPrice && (
                            <p className="mt-1 text-xs font-semibold text-[#b07255]">
                              VIP 價格已套用
                            </p>
                          )}

                          {item.isVipPrice && item.originalPrice && (
                            <p className="mt-1 text-xs text-gray-400 line-through">
                              原價 NT${" "}
                              {Number(item.originalPrice || 0).toLocaleString()}
                            </p>
                          )}
                        </div>

                        <span className="font-semibold">
                          NT${" "}
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 1)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-[#fff7ef] p-5">
            <h2 className="mb-4 text-lg font-semibold text-[#4b4038]">
              付款資訊
            </h2>

            <div className="space-y-3 text-sm leading-7 text-[#6b5c50]">
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="font-medium text-[#9b6b4f]">本次付款方式</p>
                <p className="mt-2">{paymentMethod}</p>

                {depositAmount && (
                  <p className="mt-1 font-semibold text-[#b07255]">
                    需付訂金：NT$ {depositAmount}
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="font-medium text-[#9b6b4f]">匯款資訊</p>
                <p className="mt-2">銀行：822 中國信託</p>
                <p>帳號：123456789012</p>
                <p>戶名：芷葳 王</p>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="font-medium text-[#9b6b4f]">匯款完成後</p>
                <p className="mt-2">請私訊 LINE 提供：</p>
                <p>・訂單編號</p>
                <p>・匯款後五碼</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-[#f8f3ec] p-5">
            <div className="space-y-3">
              {vipSaved > 0 && (
                <div className="flex items-center justify-between text-sm font-medium text-[#b07255]">
                  <span>VIP 優惠</span>
                  <span>- NT$ {vipSaved.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-lg font-semibold text-[#4b4038]">
                <span>訂單總金額</span>
                <span>NT$ {Number(order.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() =>
                window.open("https://line.me/R/ti/p/@929santn", "_blank")
              }
              className="w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white"
            >
              LINE 詢問訂單
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded-full border border-[#d8c5b0] bg-white py-4 text-sm text-[#6b5c50]"
            >
              回首頁繼續逛
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
