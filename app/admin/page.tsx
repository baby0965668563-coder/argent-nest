"use client";

import { useState } from "react";

export default function Page() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [products, setProducts] = useState<
    { name: string; price: string }[]
  >([]);

  function addProduct() {
    if (!name || !price) {
      alert("請輸入完整 ☁️");
      return;
    }

    setProducts([
      ...products,
      {
        name,
        price,
      },
    ]);

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
          className="mb-6 w-full rounded-full bg-black py-4 text-white"
        >
          新增商品
        </button>

        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={index}
              className="rounded-2xl border p-4"
            >
              <p className="font-bold">
                {product.name}
              </p>

              <p className="text-gray-500">
                NT$ {product.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}