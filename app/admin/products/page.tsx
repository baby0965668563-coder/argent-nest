"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  images?: string;
  options?: string;
  note?: string;
  is_active?: boolean;
  is_sold_out?: boolean;
  created_at?: string;
};

export default function AdminProductsPage() {
  const router = useRouter();

  const [checkedLogin, setCheckedLogin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    images: "",
    description: "",
    options: "",
    note: "",
    is_active: true,
    is_sold_out: false,
  });

  useEffect(() => {
    const isLogin = localStorage.getItem("argent_admin_login");

    if (isLogin !== "true") {
      router.push("/admin-login");
      return;
    }

    setCheckedLogin(true);
    fetchProducts();
  }, [router]);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert("讀取商品失敗");
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  }

  function updateForm(key: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function createProduct() {
    if (!form.name || !form.price) {
      alert("請填寫商品名稱與價格");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("products").insert([
      {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        images: form.images,
        description: form.description,
        options: form.options,
        note: form.note,
        is_active: form.is_active,
        is_sold_out: form.is_sold_out,
      },
    ]);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("新增商品失敗，請檢查 products 欄位");
      return;
    }

    alert("商品已新增 ☁️");

    setForm({
      name: "",
      price: "",
      category: "",
      images: "",
      description: "",
      options: "",
      note: "",
      is_active: true,
      is_sold_out: false,
    });

    fetchProducts();
  }

  async function toggleProduct(id: string, key: "is_active" | "is_sold_out", value: boolean) {
    const { error } = await supabase
      .from("products")
      .update({ [key]: value })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("更新商品失敗");
      return;
    }

    fetchProducts();
  }

  async function deleteProduct(id: string) {
    const ok = window.confirm("確定要刪除這個商品嗎？刪除後無法復原。");
    if (!ok) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("刪除商品失敗");
      return;
    }

    alert("商品已刪除");
    fetchProducts();
  }

  if (!checkedLogin) {
    return (
      <main className="min-h-screen bg-[#faf7f2] px-4 py-10">
        <div className="mx-auto max-w-sm rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
          檢查登入狀態中...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#4b4038]">
            商品後台
          </h1>

          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            訂單後台
          </button>
        </div>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-[#4b4038]">新增商品</h2>

          <div className="space-y-4">
            <input
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="商品名稱 *"
              className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
            />

            <input
              value={form.price}
              onChange={(e) => updateForm("price", e.target.value)}
              placeholder="價格 *"
              type="number"
              className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
            />

            <input
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
              placeholder="分類，例如：卡通療癒選物、服飾、飾品包包"
              className="w-full rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
            />

            <textarea
              value={form.images}
              onChange={(e) => updateForm("images", e.target.value)}
              placeholder="圖片網址，多張請用逗號分隔"
              className="min-h-[80px] w-full resize-none rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
            />

            <textarea
              value={form.options}
              onChange={(e) => updateForm("options", e.target.value)}
              placeholder={`商品規格，例如：\n款式｜白色、粉色、黑色\n尺寸｜S、M、L`}
              className="min-h-[100px] w-full resize-none rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
            />

            <textarea
              value={form.note}
              onChange={(e) => updateForm("note", e.target.value)}
              placeholder="商品備註，例如：預購 14–21 天、不含假日"
              className="min-h-[80px] w-full resize-none rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
            />

            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              placeholder="商品描述"
              className="min-h-[130px] w-full resize-none rounded-2xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
            />

            <div className="flex flex-wrap gap-4 text-sm text-[#6b5c50]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateForm("is_active", e.target.checked)}
                />
                上架顯示
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_sold_out}
                  onChange={(e) => updateForm("is_sold_out", e.target.checked)}
                />
                標記售完
              </label>
            </div>

            <button
              type="button"
              onClick={createProduct}
              disabled={saving}
              className="w-full rounded-full bg-[#2e2e2e] py-4 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "新增中..." : "新增商品 ☁️"}
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#4b4038]">商品列表</h2>

            <button
              type="button"
              onClick={fetchProducts}
              className="rounded-full border border-[#d8c5b0] px-4 py-2 text-sm text-[#6b5c50]"
            >
              重新整理
            </button>
          </div>

          {loading ? (
            <p className="text-center text-sm text-gray-500">商品載入中...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              目前還沒有商品
            </p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const firstImage =
                  typeof product.images === "string"
                    ? product.images.split(",")[0]?.trim()
                    : "";

                return (
                  <div
                    key={product.id}
                    className="rounded-2xl bg-[#faf7f2] p-4"
                  >
                    <div className="flex gap-4">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="h-20 w-20 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-xs text-gray-400">
                          無圖
                        </div>
                      )}

                      <div className="flex-1">
                        <p className="font-semibold text-[#4b4038]">
                          {product.name}
                        </p>

                        <p className="mt-1 text-sm text-[#6b5c50]">
                          NT$ {product.price}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {product.category || "未分類"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              toggleProduct(
                                product.id,
                                "is_active",
                                !product.is_active
                              )
                            }
                            className="rounded-full border border-[#d8c5b0] bg-white px-3 py-1 text-xs text-[#6b5c50]"
                          >
                            {product.is_active ? "已上架" : "已下架"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleProduct(
                                product.id,
                                "is_sold_out",
                                !product.is_sold_out
                              )
                            }
                            className="rounded-full border border-[#d8c5b0] bg-white px-3 py-1 text-xs text-[#6b5c50]"
                          >
                            {product.is_sold_out ? "已售完" : "未售完"}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteProduct(product.id)}
                            className="rounded-full bg-[#b85c5c] px-3 py-1 text-xs text-white"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}