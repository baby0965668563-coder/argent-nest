"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  vipPrice?: number | null;
  isVipPrice?: boolean;
  quantity: number;
  image?: string;
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

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  line_id?: string;
  shipping_method?: string;
  customer_note?: string;
  items: OrderItem[];
  total: number;
  status: string;
  order_token?: string;
};

const statusText: Record<string, string> = {
  pending: "待確認",
  paid: "已付款",
  ordered: "已訂貨",
  arrived: "已到貨",
  shipped: "已出貨",
  done: "已完成",
  cancelled: "已取消",
};

export default function AdminOrdersPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("argent_admin_login");

    if (saved === "true") {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    const password = prompt("請輸入後台密碼");

    if (password === "argentnest520" || password === "argentnest0223") {
      localStorage.setItem("argent_admin_login", "true");
      setAuthorized(true);
    } else {
      alert("密碼錯誤 ☁️");
    }

    setChecking(false);
  }, []);

  useEffect(() => {
    if (authorized) fetchOrders();
  }, [authorized]);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("讀取訂單失敗：" + error.message);
      return;
    }

    setOrders(data || []);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("狀態更新失敗：" + error.message);
      return;
    }

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

  const filteredOrders = orders.filter((order) => {
    const keyword = searchText.toLowerCase();

    return (
      order.id?.toLowerCase().includes(keyword) ||
      order.customer_name?.toLowerCase().includes(keyword) ||
      order.phone?.toLowerCase().includes(keyword) ||
      order.line_id?.toLowerCase().includes(keyword)
    );
  });

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] text-black">
        驗證中...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] text-black">
        無權限 ☁️
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-5 py-8 text-[#3d3d3d]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">訂單後台</h1>
            <p className="mt-2 text-sm text-gray-500">
              Argent Nest 訂單管理
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            返回商品後台
          </a>
        </div>

        <input
          className="mb-6 w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
          placeholder="搜尋訂單編號 / 姓名 / 電話 / LINE ID"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <div
                key={order.id}
                className="rounded-[32px] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-[#f0e7dd] pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs text-gray-400">訂單編號</p>

                    <p className="mt-1 break-all font-semibold text-[#4b4038]">
                      {order.id}
                    </p>

                    <p className="mt-2 text-sm text-[#8c7b70]">
                      {formatDate(order.created_at)}
                    </p>

                    <div className="mt-4 space-y-1 text-sm text-[#6b5c50]">
                      <p>姓名：{order.customer_name}</p>
                      <p>電話：{order.phone}</p>
                      <p className="break-all">LINE ID：{order.line_id || "-"}</p>
                      <p>取貨方式：{order.shipping_method || "-"}</p>
                    </div>

                    {order.customer_note && (
                      <div className="mt-3 rounded-2xl bg-[#f6f1ea] px-4 py-3 text-sm text-[#6b5c50]">
                        訂單備註：{order.customer_note}
                      </div>
                    )}
                  </div>

                  <div className="min-w-[180px]">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="w-full rounded-full border border-[#d8c5b0] bg-white px-4 py-3 text-sm text-[#4b4038]"
                    >
                      {Object.entries(statusText).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <p className="mt-4 text-right text-2xl font-bold text-[#4b4038]">
                      NT$ {Number(order.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="rounded-3xl border border-[#f0e7dd] bg-[#fffdfb] p-4"
                    >
                      <div className="flex gap-4">
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

                          <p className="mt-1 font-semibold text-[#4b4038]">
                            {item.name}
                          </p>

                          {item.selectedVariant?.name && (
                            <p className="mt-2 inline-flex rounded-full bg-[#f6efe7] px-3 py-1 text-xs text-[#9b6b4f]">
                              款式：{item.selectedVariant.name}
                            </p>
                          )}

                          <p className="mt-2 text-sm text-[#4b4038]">
                            NT$ {Number(item.price || 0).toLocaleString()} ×{" "}
                            {item.quantity}
                          </p>

                          {item.isVipPrice && (
                            <p className="mt-1 text-xs text-[#b07255]">
                              VIP 價已套用
                            </p>
                          )}

                          {item.note && (
                            <p className="mt-2 rounded-2xl bg-[#f6f1ea] px-3 py-2 text-xs text-[#6b5c50]">
                              顧客備註：{item.note}
                            </p>
                          )}

                          {item.productNote && (
                            <p className="mt-2 rounded-2xl bg-[#fff7ef] px-3 py-2 text-xs text-[#9b6b4f]">
                              商品備註：{item.productNote}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="rounded-[32px] bg-white p-10 text-center text-sm text-gray-400">
              目前沒有訂單
            </div>
          )}
        </div>
      </div>
    </main>
  );
}