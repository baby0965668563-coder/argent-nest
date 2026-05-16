"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (data) {
        setProduct(data);

        const imgs =
          data.images && data.images.length > 0
            ? data.images
            : [data.image];

        setMainImage(imgs[0]);
      }
    }

    fetchProduct();
  }, [id]);

  if (!product) {
    return <div className="p-10">商品讀取中...</div>;
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const lineMessage = `我想詢問：${product.name}`;

  return (
    <main className="min-h-screen bg-[#f8f5f0] text-[#2e2e2e]">
      <header className="sticky top-0 z-50 border-b border-[#e8ddd4]/70 bg-[#f8f5f0]/90 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight">
            Argent Nest 🥛🤍
          </a>

          <a
            href="/"
            className="rounded-full border border-[#d8c5b0] px-4 py-2 text-sm text-[#6b5c50]"
          >
            回首頁
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-2 md:px-10 md:py-16">
        <div>
          <div className="overflow-hidden rounded-[2.5rem] bg-[#ede6dd] shadow-[0_12px_45px_rgba(70,50,35,0.12)]">
            <img
              src={mainImage}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setMainImage(img)}
                  className={`overflow-hidden rounded-2xl border bg-[#ede6dd] ${
                    mainImage === img
                      ? "border-[#8b6f5c]"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name}-${index}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#a08060]">
            {product.category || "Argent Nest"}
          </p>

          <h1 className="mb-5 text-3xl font-bold leading-tight md:text-5xl">
            {product.name}
          </h1>

          <p className="mb-8 text-3xl font-bold text-[#8b6f5c]">
            NT$ {Number(product.price).toLocaleString()}
          </p>

          {product.options && (
            <div className="mb-8 rounded-[2rem] border border-[#e8ddd4] bg-[#fdf9f6] p-6">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#a08060]">
                商品規格
              </p>

              <p className="whitespace-pre-line text-sm leading-8 text-[#6b5c50]">
                {product.options}
              </p>
            </div>
          )}

          <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#a08060]">
              商品說明
            </p>

            <p className="whitespace-pre-line text-sm leading-8 text-[#6b5c50]">
              {product.description}
            </p>
          </div>

          <a
            href={`https://line.me/R/oaMessage/@929santn/?${encodeURIComponent(
              lineMessage
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 block rounded-full bg-[#06C755] py-4 text-center font-semibold text-white shadow-[0_8px_25px_rgba(6,199,85,0.25)] transition hover:scale-[1.02]"
          >
            立即詢問 / 下單 ☁️
          </a>

          <div className="rounded-[2rem] border border-[#e8ddd4] bg-[#fdf9f6] p-6">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#a08060]">
              購買須知
            </p>

            <div className="space-y-3 text-sm leading-7 text-[#6b5c50]">
              <p>☁️ 全館為預購商品</p>
              <p>☁️ 出貨約 14–21 天，不含假日與連續假期</p>
              <p>☁️ 無法等待請勿下單</p>
              <p>☁️ 商品顏色以實物為準，螢幕色差請見諒</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8ddd4] px-5 py-8 text-center text-xs text-[#b0a090]">
        © 2026 Argent Nest 🥛🤍 · Healing Select Shop
      </footer>
    </main>
  );
}
