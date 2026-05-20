"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  category?: string;
  image?: string;
  images?: string[];
  description?: string;
  is_active?: boolean;
  is_sold_out?: boolean;
  is_featured?: boolean;
  stock?: number;
};

const categoryMap: Record<string, string> = {
  healing: "卡通療癒選物",
  clothes: "微辣韓系穿搭",
  accessories: "飾品包包",
  flowers: "花束甜點",
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();

  const slug = String(params?.slug || "");
  const categoryName = categoryMap[slug] || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [slug]);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", categoryName)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  }

  const title = useMemo(() => {
    if (categoryName) return categoryName;
    return "分類商品";
  }, [categoryName]);

  if (!categoryName) {
    return (
      <main className="min-h-screen bg-[#faf7f2] px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#4b4038]">找不到分類 ☁️</h1>

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

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#9b8b80]">Argent Nest Select</p>
            <h1 className="mt-1 text-3xl font-bold text-[#4b4038]">{title}</h1>
          </div>

          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="rounded-full border border-[#d8c5b0] bg-white px-5 py-3 text-sm text-[#6b5c50] shadow-sm"
          >
            🛒 購物車
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            商品載入中...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            這個分類目前還沒有商品 ☁️
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => {
              const imageSrc =
                product.image ||
                (Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : "");

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="overflow-hidden rounded-3xl bg-white text-left shadow-sm transition active:scale-[0.98]"
                >
                  <div className="aspect-square bg-[#eee5dc]">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-semibold leading-6 text-[#4b4038]">
                      {product.name}
                    </p>

                    <p className="mt-2 font-bold text-[#4b4038]">
                      NT$ {Number(product.price || 0).toLocaleString()}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.is_featured && (
                        <span className="rounded-full bg-[#fff3cc] px-2 py-1 text-[11px] text-[#9b6b4f]">
                          HOT
                        </span>
                      )}

                      {product.is_sold_out ? (
                        <span className="rounded-full bg-gray-200 px-2 py-1 text-[11px] text-gray-600">
                          已售完
                        </span>
                      ) : Number(product.stock || 0) > 0 ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] text-green-700">
                          現貨
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] text-blue-700">
                          預購
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}