"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function addProduct() {
    if (!name) return alert("請輸入商品名稱");
    if (!price) return alert("請輸入商品價格");

    setLoading(true);

    const { error } = await supabase.from("products").insert([
      {
        name,
        price,
        category: "未分類",
        description: "",
        image: "",
        images: [],
        sort_order: 0,
        is_active: true,
        is_sold_out: false,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("新增失敗：" + error.message);
      return;
    }

    alert("新增成功 ☁️");
    setName("");
    setPrice("");
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] p-5 text-black">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold">
          Argent Nest 後台 ☁️
        </h1>

        <input
          placeholder="商品名稱"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-2xl border p-4"
        />

        <input
          placeholder="商品價格"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mb-4 w-full rounded-2xl border p-4"
        />

        <button
          onClick={addProduct}
          disabled={loading}
          className="w-full rounded-full bg-black py-4 text-white disabled:opacity-50"
        >
          {loading ? "新增中..." : "新增商品"}
        </button>
      </div>
    </main>
  );
}