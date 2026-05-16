"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [checkedLogin, setCheckedLogin] = useState(false);

  useEffect(() => {
    const login = localStorage.getItem(
      "argent_admin_login"
    );

    if (login !== "true") {
      window.location.href = "/admin-login";
      return;
    }

    setCheckedLogin(true);
  }, []);

  if (!checkedLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        讀取中...
      </main>
    );
  }

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [options, setOptions] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: false });

    setProducts(data || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const keyword = searchText.toLowerCase();

    return (
      product.name?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword)
    );
  });

  function resetForm() {
    setName("");
    setPrice("");
    setCategory("");
    setSortOrder("0");
    setOptions("");
    setDescription("");
    setIsActive(true);
    setIsSoldOut(false);
    setImages([]);
    setEditingId(null);
    setEditingImages([]);
  }

  async function uploadOneImage(file: File) {
    const fileName = `public/${uuidv4()}.jpg`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

    if (error) {
      alert("圖片上傳失敗：" + error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function uploadImages(files: File[]) {
    const urls: string[] = [];

    for (const file of files) {
      const url = await uploadOneImage(file);
      if (url) urls.push(url);
    }

    return urls;
  }

  async function addProduct() {
    if (!name) return alert("請輸入商品名稱");
    if (!price) return alert("請輸入價格");
    if (!category) return alert("請選擇商品分類");
    if (images.length === 0)
      return alert("請選擇至少一張圖片");

    setLoading(true);

    const imageUrls = await uploadImages(images);

    if (imageUrls.length === 0) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("products")
      .insert([
        {
          name,
          price,
          category,
          sort_order: Number(sortOrder) || 0,
          options,
          description,
          is_active: isActive,
          is_sold_out: isSoldOut,
          image: imageUrls[0],
          images: imageUrls,
        },
      ]);

    setLoading(false);

    if (error) {
      alert("新增失敗：" + error.message);
      return;
    }

    alert("新增成功！");
    resetForm();
    fetchProducts();
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-5 py-8 text-[#3d3d3d]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            管理後台
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Argent Nest 商品管理
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem(
              "argent_admin_login"
            );

            window.location.href = "/admin-login";
          }}
          className="rounded-full border px-4 py-2 text-sm"
        >
          登出
        </button>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">
          新增商品
        </h2>

        <div className="space-y-4">
          <input
            className="w-full rounded-2xl border p-4"
            placeholder="商品名稱"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            className="w-full rounded-2xl border p-4"
            placeholder="價格"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
          />

          <select
            className="w-full rounded-2xl border p-4"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="">
              請選擇商品分類
            </option>

            <option value="療癒娃娃">
              療癒娃娃
            </option>

            <option value="微辣穿搭">
              微辣穿搭
            </option>

            <option value="女孩小物">
              女孩小物
            </option>

            <option value="甜點研究所">
              甜點研究所
            </option>
          </select>

          <textarea
            className="w-full rounded-2xl border p-4"
            placeholder={`商品規格，例如：
顏色|奶油白,黑色
尺寸|S,M,L`}
            value={options}
            onChange={(e) =>
              setOptions(e.target.value)
            }
          />

          <textarea
            className="w-full rounded-2xl border p-4"
            placeholder="商品描述"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full rounded-2xl border p-4"
            onChange={(e) => {
              const files = Array.from(
                e.target.files || []
              );

              setImages(files);
            }}
          />

          <button
            onClick={addProduct}
            disabled={loading}
            className="w-full rounded-full bg-black py-4 text-white"
          >
            {loading
              ? "處理中..."
              : "新增商品"}
          </button>
        </div>
      </div>
    </main>
  );
}