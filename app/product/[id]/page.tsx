"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    fetchProduct();
  }, []);

  async function fetchProduct() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();

    if (data) {
      setProduct(data);

      if (data.images?.length > 0) {
        setSelectedImage(data.images[0]);
      } else {
        setSelectedImage(data.image);
      }
    }
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] text-black">
        載入中...
      </main>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  return (
    <main className="min-h-screen bg-[#f8f5f2] pb-24 text-black">
      <div className="mx-auto max-w-md">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-[#f8f5f2]/95 px-5 py-4 text-black backdrop-blur">
          <button
            onClick={() => window.history.back()}
            className="rounded-full border border-[#d8c5b0] px-4 py-2 text-sm text-black"
          >
            返回
          </button>

          <h1 className="text-sm font-bold text-black">
            Argent Nest 🥛🤍
          </h1>

          <div className="w-[60px]" />
        </div>

        <div className="p-5">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <img
              src={selectedImage}
              className="aspect-square w-full object-cover"
            />
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {images.map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 ${
                  selectedImage === img
                    ? "border-black"
                    : "border-transparent"
                }`}
              >
                <img
                  src={img}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[2rem] bg-white p-6 text-black shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#8b6f5c]">
                  Argent Nest
                </p>

                <h2 className="mt-2 text-2xl font-bold leading-tight text-black">
                  {product.name}
                </h2>
              </div>

              {product.is_sold_out && (
                <div className="rounded-full bg-red-500 px-4 py-2 text-xs text-white">
                  SOLD OUT
                </div>
              )}
            </div>

            <p className="mt-5 text-3xl font-bold text-black">
              NT$ {product.price}
            </p>

            <div className="mt-5">
              <div className="inline-block rounded-full bg-[#f5eee7] px-4 py-2 text-sm font-medium text-[#8b6f5c]">
                {product.category}
              </div>
            </div>

            {product.description && (
              <div className="mt-8 border-t border-[#eee5dc] pt-6">
                <p className="mb-3 text-sm font-bold text-black">
                  商品介紹
                </p>

                <p className="whitespace-pre-line text-sm leading-8 text-[#4a4a4a]">
                  {product.description}
                </p>
              </div>
            )}

            {product.options && (
              <div className="mt-8 border-t border-[#eee5dc] pt-6">
                <p className="mb-3 text-sm font-bold text-black">
                  商品規格
                </p>

                <div className="space-y-3">
                  {product.options
                    .split("\n")
                    .map((line: string, index: number) => {
                      const parts = line.includes("|")
                        ? line.split("|")
                        : line.split("：");

                      if (parts.length < 2) return null;

                      return (
                        <div
                          key={index}
                          className="rounded-2xl bg-[#f8f5f2] p-4"
                        >
                          <p className="text-xs font-medium text-[#8b6f5c]">
                            {parts[0]}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-black">
                            {parts.slice(1).join("：")}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-[#eee5dc] bg-white p-4">
          <div className="mx-auto max-w-md">
            <button
              className={`w-full rounded-full py-4 text-sm font-medium text-white ${
                product.is_sold_out ? "bg-gray-400" : "bg-black"
              }`}
            >
              {product.is_sold_out ? "已售完" : "加入購物車"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}