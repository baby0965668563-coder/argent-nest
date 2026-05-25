"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Variant = {
  id: string;
  name: string;
  price?: number;
  vipPrice?: number;
  stock?: number;
};

type Product = {
  id?: string;

  name: string;

  price: number;

  image: string;

  images: string[];

  category: string;

  description: string;

  product_note: string;

  status: boolean;

  can_order: boolean;

  variants: Variant[];
};

export default function AdminPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [product, setProduct] =
    useState<Product>({
      name: "",
      price: 0,
      image: "",
      images: [],
      category: "",
      description: "",
      product_note: "",
      status: true,
      can_order: true,
      variants: [],
    });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } =
      await supabase
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    setProducts(data || []);
  }

  function updateProduct(
    key: keyof Product,
    value: any
  ) {
    setProduct((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function addVariant() {
    setProduct((prev) => ({
      ...prev,

      variants: [
        ...(prev.variants || []),

        {
          id: crypto.randomUUID(),

          name: "",

          price: prev.price,

          vipPrice: 0,

          stock: 0,
        },
      ],
    }));
  }

  function updateVariant(
    index: number,
    key: keyof Variant,
    value: any
  ) {
    const newVariants = [
      ...(product.variants || []),
    ];

    newVariants[index] = {
      ...newVariants[index],
      [key]: value,
    };

    setProduct((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  }

  function removeVariant(
    index: number
  ) {
    const newVariants =
      product.variants.filter(
        (_, i) => i !== index
      );

    setProduct((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  }

  async function addProduct() {
    if (!product.name) {
      alert("請輸入商品名稱");
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase
          .from("products")
          .insert([
            {
              ...product,

              price: Number(
                product.price || 0
              ),

              variants:
                product.variants.map(
                  (variant) => ({
                    ...variant,

                    price: Number(
                      variant.price || 0
                    ),

                    vipPrice:
                      Number(
                        variant.vipPrice ||
                          0
                      ),

                    stock: Number(
                      variant.stock ||
                        0
                    ),
                  })
                ),
            },
          ]);

      if (error) {
        console.error(error);

        alert("新增失敗");

        return;
      }

      alert("新增成功 ☁️");

      setProduct({
        name: "",
        price: 0,
        image: "",
        images: [],
        category: "",
        description: "",
        product_note: "",
        status: true,
        can_order: true,
        variants: [],
      });

      fetchProducts();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#a08060]">
            Argent Nest
          </p>

          <h1 className="text-3xl font-bold text-[#4b4038]">
            商品管理後台 ☁️
          </h1>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4">
            <input
              value={product.name}
              onChange={(e) =>
                updateProduct(
                  "name",
                  e.target.value
                )
              }
              placeholder="商品名稱"
              className="w-full rounded-2xl border border-[#e5d8ca] px-4 py-3 outline-none"
            />

            <input
              type="number"
              value={product.price}
              onChange={(e) =>
                updateProduct(
                  "price",
                  Number(
                    e.target.value
                  )
                )
              }
              placeholder="商品價格"
              className="w-full rounded-2xl border border-[#e5d8ca] px-4 py-3 outline-none"
            />

            <input
              value={product.image}
              onChange={(e) =>
                updateProduct(
                  "image",
                  e.target.value
                )
              }
              placeholder="封面圖片網址"
              className="w-full rounded-2xl border border-[#e5d8ca] px-4 py-3 outline-none"
            />

            <textarea
              value={product.description}
              onChange={(e) =>
                updateProduct(
                  "description",
                  e.target.value
                )
              }
              placeholder="商品描述"
              className="min-h-[140px] w-full rounded-2xl border border-[#e5d8ca] px-4 py-3 outline-none"
            />

            <textarea
              value={
                product.product_note
              }
              onChange={(e) =>
                updateProduct(
                  "product_note",
                  e.target.value
                )
              }
              placeholder="商品備註"
              className="min-h-[120px] w-full rounded-2xl border border-[#e5d8ca] px-4 py-3 outline-none"
            />
          </div>

          <div className="mt-8 rounded-[28px] border border-[#f0e7dd] bg-[#fffdfb] p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#4b4038]">
                款式 Variants
              </h2>

              <button
                type="button"
                onClick={addVariant}
                className="rounded-full bg-[#2e2e2e] px-5 py-2 text-sm text-white"
              >
                新增款式
              </button>
            </div>

            <div className="space-y-4">
              {product.variants.map(
                (
                  variant,
                  index
                ) => (
                  <div
                    key={
                      variant.id
                    }
                    className="rounded-3xl border border-[#efe5d9] bg-white p-4"
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                      <input
                        value={
                          variant.name
                        }
                        onChange={(
                          e
                        ) =>
                          updateVariant(
                            index,
                            "name",
                            e.target
                              .value
                          )
                        }
                        placeholder="款式名稱"
                        className="rounded-2xl border border-[#e5d8ca] px-4 py-3 outline-none"
                      />

                      <input
                        type="number"
                        value={
                          variant.price
                        }
                        onChange={(
                          e
                        ) =>
                          updateVariant(
                            index,
                            "price",
                            Number(
                              e
                                .target
                                .value
                            )
                          )
                        }
                        placeholder="價格"
                        className="rounded-2xl border border-[#e5d8ca] px-4 py-3 outline-none"
                      />

                      <input
                        type="number"
                        value={
                          variant.vipPrice
                        }
                        onChange={(
                          e
                        ) =>
                          updateVariant(
                            index,
                            "vipPrice",
                            Number(
                              e
                                .target
                                .value
                            )
                          )
                        }
                        placeholder="VIP價格"
                        className="rounded-2xl border border-[#e5d8ca] px-4 py-3 outline-none"
                      />

                      <input
                        type="number"
                        value={
                          variant.stock
                        }
                        onChange={(
                          e
                        ) =>
                          updateVariant(
                            index,
                            "stock",
                            Number(
                              e
                                .target
                                .value
                            )
                          )
                        }
                        placeholder="庫存"
                        className="rounded-2xl border border-[#e5d8ca] px-4 py-3 outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeVariant(
                          index
                        )
                      }
                      className="mt-4 text-sm text-red-400"
                    >
                      刪除此款式
                    </button>
                  </div>
                )
              )}

              {product.variants
                .length === 0 && (
                <div className="rounded-3xl bg-[#faf7f2] p-5 text-sm text-[#8c7b70]">
                  尚未新增款式
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={addProduct}
            disabled={loading}
            className="mt-8 w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white"
          >
            {loading
              ? "新增中..."
              : "新增商品 ☁️"}
          </button>
        </div>

        <div className="mt-10">
          <h2 className="mb-5 text-xl font-semibold text-[#4b4038]">
            已上架商品
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {products.map(
              (item) => (
                <div
                  key={item.id}
                  className="rounded-[28px] bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    {item.image ? (
                      <img
                        src={
                          item.image
                        }
                        alt={
                          item.name
                        }
                        className="h-24 w-24 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#f3eee8] text-xs text-gray-400">
                        無圖
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="text-lg font-semibold text-[#4b4038]">
                        {item.name}
                      </p>

                      <p className="mt-2 text-sm text-[#8c7b70]">
                        NT$
                        {" "}
                        {Number(
                          item.price || 0
                        ).toLocaleString()}
                      </p>

                      <p className="mt-2 text-xs text-[#b58b6b]">
                        款式數：
                        {" "}
                        {item
                          .variants
                          ?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}