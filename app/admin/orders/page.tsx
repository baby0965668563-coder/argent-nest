"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Order = {
  id: string;

  created_at: string;

  customer_name: string;

  phone: string;

  line_id?: string;

  shipping_method?: string;

  customer_note?: string;

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

export default function OrdersPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [user, setUser] =
    useState<any>(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const savedUser =
        localStorage.getItem(
          "argent_user"
        );

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const parsedUser =
        JSON.parse(savedUser);

      setUser(parsedUser);

      await fetchOrders(
        parsedUser
      );
    } catch (err) {
      console.error(err);

      localStorage.removeItem(
        "argent_user"
      );

      router.push("/login");
    }
  }

  async function fetchOrders(
    currentUser: any
  ) {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("orders")
      .select("*")
      .eq(
        "line_id",
        currentUser?.line_user_id
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);

      setOrders([]);

      setLoading(false);

      return;
    }

    setOrders(data || []);

    setLoading(false);
  }

  function formatDate(
    date: string
  ) {
    return new Date(date)
      .toLocaleString("zh-TW", {
        year: "numeric",

        month: "2-digit",

        day: "2-digit",

        hour: "2-digit",

        minute: "2-digit",
      });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4">
        <div className="rounded-3xl bg-white px-8 py-6 text-[#6b5c50] shadow-sm">
          訂單載入中...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="text-5xl">
            ☁️
          </div>

          <h1 className="mt-4 text-3xl font-bold text-[#4b4038]">
            我的訂單
          </h1>

          <p className="mt-3 text-sm text-[#8c7b70]">
            Argent Nest 訂單紀錄
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-[32px] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#4b4038]">
              目前還沒有訂單 ☁️
            </p>

            <p className="mt-3 text-sm leading-7 text-[#8c7b70]">
              去逛逛療癒小物吧 🤍
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="mt-6 rounded-full bg-[#2e2e2e] px-6 py-3 text-sm text-white"
            >
              回首頁
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() =>
                  router.push(
                    `/orders/${order.id}?token=${order.order_token}`
                  )
                }
                className="w-full rounded-[32px] bg-white p-5 text-left shadow-sm transition hover:translate-y-[-2px]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs text-gray-400">
                      訂單編號
                    </p>

                    <p className="mt-1 break-all font-medium text-[#4b4038]">
                      {order.id}
                    </p>

                    <p className="mt-3 text-sm text-[#8c7b70]">
                      {formatDate(
                        order.created_at
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className="rounded-full bg-[#f6efe7] px-4 py-2 text-xs font-medium text-[#9b6b4f]">
                      {statusText[
                        order.status
                      ] || order.status}
                    </span>

                    <p className="text-lg font-semibold text-[#4b4038]">
                      NT$
                      {" "}
                      {Number(
                        order.total || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* bottom */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() =>
              router.push("/member")
            }
            className="w-full rounded-full border border-[#d8c5b0] bg-white py-4 text-sm text-[#6b5c50]"
          >
            返回會員中心
          </button>
        </div>
      </div>
    </main>
  );
}
