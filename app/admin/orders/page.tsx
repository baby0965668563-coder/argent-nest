"use client";

import { useEffect, useMemo, useState } from "react";
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
};

const statusOptions = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待確認" },
  { value: "paid", label: "已付款" },
  { value: "ordered", label: "已訂貨" },
  { value: "arrived", label: "已到貨" },
  { value: "shipped", label: "已出貨" },
  { value: "done", label: "已完成" },
  { value: "cancelled", label: "已取消" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keywordText = keyword.trim().toLowerCase();

      const matchKeyword =
        !keywordText ||
        order.customer_name?.toLowerCase().includes(keywordText) ||
        order.phone?.toLowerCase().includes(keywordText) ||
        order.line_id?.toLowerCase().includes(keywordText) ||
        order.id?.toLowerCase().includes(keywordText);

      const matchStatus =
        statusFilter === "all" || (order.status || "pending") === statusFilter;

      return matchKeyword && matchStatus;
    });
  }, [orders, keyword, statusFilter]);

  async function fetchOrders() {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("讀取訂單失敗");
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  }

  async function updateStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.error(error);
      alert("更新狀態失敗");
      return;
    }

    fetchOrders();
  }

  async function cancelOrder(orderId: string) {
    const ok = window.confirm("確定要取消這筆訂單嗎？");
    if (!ok) return;

    await updateStatus(orderId, "cancelled");
  }

  async function deleteOrder(orderId: string) {
    const ok = window.confirm(
      "確定要永久刪除這筆訂單嗎？\n\n刪除後無法復原。"
    );

    if (!ok) return;

    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      console.error(error);
      alert("刪除訂單失敗");
      return;
    }

    alert("訂單已刪除");
    fetchOrders();
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

  function buildOrderText(order: Order) {
    const itemsText = (order.items || [])
      .map((item, index) => {
        const optionsText = item.options
          ? Object.entries(item.options)
              .map(([key, value]) => `${key}：${value}`)
              .join("\n")
          : "";

        return [
          `${index + 1}. ${item.name}`,
          optionsText,
          item.productNote ? `商品備註：${item.productNote}` : "",
          item.note ? `顧客備註：${item.note}` : "",
          `數量：${item.quantity}`,
          `單價：NT$ ${item.price}`,
          `小計：NT$ ${
            Number(item.price || 0) * Number(item.quantity || 1)
          }`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    return `【Argent Nest 訂單】

訂單編號：${order.id}
訂單時間：${formatDate(order.created_at)}
訂單狀態：${order.status || "pending"}

姓名：${order.customer_name}
電話：${order.phone}
LINE ID：${order.line_id || "未填"}
取貨方式：${order.shipping_method || "未填"}

訂單備註：
${order.customer_note || "無"}

商品明細：
${itemsText}

訂單總金額：NT$ ${order.total}`;
  }

  async function copyOrder(order: Order) {
    const text = buildOrderText(order);
    await navigator.clipboard.writeText(text);
    alert("已複製訂單內容 ☁️");
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#4b4038]">
            訂單後台
          </h1>

          <button
            type="button"
            onClick={fetchOrders}
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            重新整理
          </button>
        </div>

        <div className="mb-5 rounded-3xl bg-white p-4 shadow-sm">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋姓名、電話、LINE ID、訂單編號"
            className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
          />

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => setStatusFilter(status.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  statusFilter === status.value
                    ? "bg-[#2e2e2e] text-white"
                    : "border border-[#d8c5b0] bg-white text-[#6b5c50]"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-400">
            目前顯示 {filteredOrders.length} 筆訂單
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            訂單載入中...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            沒有符合條件的訂單 ☁️
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs text-gray-400">
                      {formatDate(order.created_at)}
                    </p>

                    <p className="mt-1 break-all text-xs text-gray-400">
                      訂單編號：{order.id}
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-[#4b4038]">
                      {order.customer_name}
                    </h2>

                    <p className="mt-1 text-sm text-[#6b5c50]">
                      電話：{order.phone}
                    </p>

                    {order.line_id && (
                      <p className="mt-1 text-sm text-[#6b5c50]">
                        LINE ID：{order.line_id}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-[#6b5c50]">
                      取貨方式：{order.shipping_method || "未填"}
                    </p>

                    {order.customer_note && (
                      <p className="mt-2 rounded-2xl bg-[#f6f1ea] px-3 py-2 text-sm text-[#6b5c50]">
                        訂單備註：{order.customer_note}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    <span className="w-fit rounded-full bg-[#fff7ef] px-3 py-1 text-sm text-[#9b6b4f]">
                      {order.status || "pending"}
                    </span>

                    <select
                      value={order.status || "pending"}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="rounded-full border border-[#d8c5b0] bg-white px-3 py-2 text-sm text-[#6b5c50] outline-none"
                    >
                      {statusOptions
                        .filter((s) => s.value !== "all")
                        .map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => copyOrder(order)}
                      className="rounded-full bg-[#2e2e2e] px-4 py-2 text-sm text-white"
                    >
                      複製訂單
                    </button>

                    {order.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => cancelOrder(order.id)}
                        className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#9b6b4f]"
                      >
                        取消訂單
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      className="rounded-full bg-[#b85c5c] px-4 py-2 text-sm text-white"
                    >
                      刪除訂單
                    </button>
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#f0e6dc] pt-4">
                  {(order.items || []).map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="rounded-2xl bg-[#faf7f2] p-3"
                    >
                      <div className="flex gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-xs text-gray-400">
                            無圖
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="font-medium text-[#4b4038]">
                            {item.name}
                          </p>

                          {item.options &&
                            Object.entries(item.options).map(([key, value]) => (
                              <p
                                key={key}
                                className="mt-1 text-sm text-gray-500"
                              >
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
                              NT${" "}
                              {Number(item.price || 0) *
                                Number(item.quantity || 1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between text-lg font-semibold text-[#4b4038]">
                  <span>訂單總金額</span>
                  <span>NT$ {order.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}