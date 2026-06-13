"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type OrderItem = {
  id?: string;
  name?: string;
  quantity?: number;
  category?: string;
  variantName?: string;
  selectedVariant?: {
    name?: string;
  } | null;
  options?: Record<string, string>;
};

type Order = {
  id: string;
  created_at?: string;
  customer_name?: string;
  status?: string;
  items?: OrderItem[];
};

type PurchaseRow = {
  key: string;
  name: string;
  variantName: string;
  category: string;
  quantity: number;
  orderCount: number;
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

export default function AdminPurchasePage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      alert("讀取訂單失敗：" + error.message);
      return;
    }

    setOrders(data || []);
  }

  function getVariantName(item: OrderItem) {
    return (
      item.selectedVariant?.name ||
      item.variantName ||
      item.options?.["款式"] ||
      ""
    );
  }

  function shouldIncludeOrder(order: Order) {
    const status = order.status || "pending";

    if (statusFilter === "all") return true;
    if (statusFilter === "active") return status !== "cancelled";
    return status === statusFilter;
  }

  const categories = useMemo(() => {
    const set = new Set<string>();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (item.category) set.add(item.category);
      });
    });

    return Array.from(set);
  }, [orders]);

  const purchaseRows = useMemo(() => {
    const map = new Map<string, PurchaseRow>();

    orders.filter(shouldIncludeOrder).forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.name || "未命名商品";
        const variantName = getVariantName(item);
        const category = item.category || "未分類";
        const quantity = Number(item.quantity || 1);

        if (categoryFilter !== "all" && category !== categoryFilter) return;

        const keyword = searchText.trim().toLowerCase();
        const searchable = `${name} ${variantName} ${category}`.toLowerCase();

        if (keyword && !searchable.includes(keyword)) return;

        const key = `${name}__${variantName}`;

        const existing = map.get(key);

        if (existing) {
          existing.quantity += quantity;
          existing.orderCount += 1;
        } else {
          map.set(key, {
            key,
            name,
            variantName,
            category,
            quantity,
            orderCount: 1,
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      if (a.name !== b.name) return a.name.localeCompare(b.name);
      return a.variantName.localeCompare(b.variantName);
    });
  }, [orders, statusFilter, categoryFilter, searchText]);

  const totalQuantity = purchaseRows.reduce(
    (sum, row) => sum + Number(row.quantity || 0),
    0
  );

  const copyText = purchaseRows
    .map((row) => {
      const title = row.variantName
        ? `${row.name}｜${row.variantName}`
        : row.name;

      return `${title}*${row.quantity}`;
    })
    .join("\n");

  async function copyPurchaseList() {
    if (!copyText) {
      alert("目前沒有可複製的叫貨資料");
      return;
    }

    await navigator.clipboard.writeText(copyText);
    alert("已複製叫貨清單 ☁️");
  }

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
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#a08060]">
              PURCHASE
            </p>

            <h1 className="text-3xl font-bold text-[#4b4038]">
              叫貨統計 ☁️
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              自動統計訂單商品與款式數量
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/admin"
              className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
            >
              商品後台
            </a>

            <a
              href="/admin/orders"
              className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
            >
              訂單後台
            </a>

            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="rounded-full bg-[#2e2e2e] px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? "讀取中..." : "重新整理"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            className="rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder="搜尋商品 / 款式 / 分類"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
          >
            <option value="active">排除已取消</option>
            <option value="all">全部訂單</option>
            {Object.entries(statusText).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
          >
            <option value="all">全部分類</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={copyPurchaseList}
            className="rounded-2xl bg-black p-4 text-sm text-white"
          >
            一鍵複製叫貨清單
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-400">統計品項</p>
            <p className="mt-2 text-2xl font-bold text-[#4b4038]">
              {purchaseRows.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-400">叫貨總數</p>
            <p className="mt-2 text-2xl font-bold text-[#4b4038]">
              {totalQuantity}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-400">訂單數</p>
            <p className="mt-2 text-2xl font-bold text-[#4b4038]">
              {orders.filter(shouldIncludeOrder).length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-400">分類</p>
            <p className="mt-2 text-2xl font-bold text-[#4b4038]">
              {categoryFilter === "all" ? "全部" : categoryFilter}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[#4b4038]">
              統計結果
            </h2>

            <div className="space-y-3">
              {purchaseRows.map((row) => (
                <div
                  key={row.key}
                  className="rounded-2xl border border-[#f0e7dd] bg-[#fffdfb] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#b58b6b]">{row.category}</p>

                      <p className="mt-1 font-semibold text-[#4b4038]">
                        {row.name}
                      </p>

                      {row.variantName && (
                        <p className="mt-1 text-sm text-[#8c7b70]">
                          款式：{row.variantName}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-gray-400">
                        來自 {row.orderCount} 筆訂單
                      </p>
                    </div>

                    <p className="min-w-[70px] text-right text-2xl font-bold text-[#4b4038]">
                      × {row.quantity}
                    </p>
                  </div>
                </div>
              ))}

              {purchaseRows.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-400">
                  目前沒有符合條件的叫貨資料
                </p>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-[32px] bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="mb-4 text-xl font-bold text-[#4b4038]">
              可複製叫貨清單
            </h2>

            <textarea
              readOnly
              value={copyText}
              className="min-h-[360px] w-full rounded-2xl border border-[#ddd] bg-[#faf7f2] p-4 text-sm leading-7 text-[#4b4038]"
              placeholder="叫貨清單會顯示在這裡"
            />

            <button
              type="button"
              onClick={copyPurchaseList}
              className="mt-4 w-full rounded-full bg-black py-4 text-sm text-white"
            >
              複製文字
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
