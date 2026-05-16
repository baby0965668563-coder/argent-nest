"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const searchParams = useSearchParams();

  const adminKey = searchParams.get("key");

  const correctKey = "argentnest520";

  if (adminKey !== correctKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] px-5">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#a08060]">
            Argent Nest
          </p>

          <h1 className="mb-4 text-3xl font-bold">
            無權限進入 ☁️
          </h1>

          <p className="text-sm leading-8 text-[#6b5c50]">
            請使用正確的後台連結。
          </p>
        </div>
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
    if (images.length === 0) return alert("請選擇至少一張圖片");

    setLoading(true);

    const imageUrls = await uploadImages(images);

    if (imageUrls.length === 0) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("products").insert([
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

  async function updateProduct() {
    if (!editingId) return;

    setLoading(true);

    let imageUrls = editingImages;

    if (images.length > 0) {
      const uploadedUrls = await uploadImages(images);

      if (uploadedUrls.length === 0) {
        setLoading(false);
        return;
      }

      imageUrls = uploadedUrls;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name,
        price,
        category,
        sort_order: Number(sortOrder) || 0,
        options,
        description,
        is_active: isActive,
        is_sold_out: isSoldOut,
        image: imageUrls[0] || "",
        images: imageUrls,
      })
      .eq("id", editingId);

    setLoading(false);

    if (error) {
      alert("修改失敗：" + error.message);
      return;
    }

    alert("修改成功！");
    resetForm();
    fetchProducts();
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      alert("狀態修改失敗：" + error.message);
      return;
    }

    fetchProducts();
  }

  async function toggleSoldOut(id: number, currentStatus: boolean) {
    const { error } = await supabase
      .from("products")
      .update({ is_sold_out: !currentStatus })
      .eq("id", id);

    if (error) {
      alert("售完狀態修改失敗：" + error.message);
      return;
    }

    fetchProducts();
  }

  async function deleteProduct(id: number) {
    if (!confirm("確定要刪除這個商品嗎？")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert("刪除失敗：" + error.message);
      return;
    }

    alert("刪除成功");
    fetchProducts();
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-5 py-8 text-[#3d3d3d]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">管理後台</h1>
          <p className="mt-2 text-sm text-gray-500">
            Argent Nest 商品管理
          </p>
        </div>

        <a
          href="/"
          className="rounded-full border px-4 py-2 text-sm"
        >
          回首頁
        </a>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">
          {editingId ? "編輯商品" : "新增商品"}
        </h2>

        <div className="space-y-4">
          <input
            className="w-full rounded-2xl border p-4"
            placeholder="商品名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border p-4"
            placeholder="價格"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <select
            className="w-full rounded-2xl border p-4"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">請選擇商品分類</option>
            <option value="療癒娃娃">療癒娃娃</option>
            <option value="微辣穿搭">微辣穿搭</option>
            <option value="女孩小物">女孩小物</option>
            <option value="甜點研究所">甜點研究所</option>
          </select>

          <input
            className="w-full rounded-2xl border p-4"
            placeholder="商品排序，數字越小越前面"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />

          <textarea
            className="w-full rounded-2xl border p-4"
            placeholder={`商品規格，例如：
顏色|奶油白,黑色
尺寸|S,M,L
款式|A款,B款`}
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />

          <textarea
            className="w-full rounded-2xl border p-4"
            placeholder="商品描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="flex items-center justify-between rounded-2xl border p-4">
            <span className="text-sm font-medium">
              {isActive ? "目前狀態：上架中" : "目前狀態：已下架"}
            </span>

            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border p-4">
            <span className="text-sm font-medium">
              {isSoldOut ? "銷售狀態：已售完" : "銷售狀態：可下單"}
            </span>

            <input
              type="checkbox"
              checked={isSoldOut}
              onChange={(e) => setIsSoldOut(e.target.checked)}
              className="h-5 w-5"
            />
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            className="w-full rounded-2xl border p-4"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setImages(files);
            }}
          />

          <button
            onClick={editingId ? updateProduct : addProduct}
            disabled={loading}
            className="w-full rounded-full bg-black py-4 text-white disabled:opacity-50"
          >
            {loading
              ? "處理中..."
              : editingId
              ? "儲存修改"
              : "新增商品"}
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">商品清單</h2>

        <input
          className="mb-5 w-full rounded-2xl border p-4"
          placeholder="搜尋商品名稱、分類、描述"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const active = product.is_active !== false;
            const soldOut = product.is_sold_out === true;

            return (
              <div
                key={product.id}
                className="rounded-2xl border p-4"
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {active ? "上架中" : "已下架"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      soldOut
                        ? "bg-red-100 text-red-600"
                        : "bg-[#f3ede6] text-[#8b6f5c]"
                    }`}
                  >
                    {soldOut ? "已售完" : "可下單"}
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                    {product.image && (
                      <img
                        src={product.image}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold">
                      {product.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      NT$ {product.price}
                    </p>

                    <p className="mt-1 text-xs text-[#b58b6b]">
                      {product.category}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setEditingId(product.id);
                      setName(product.name || "");
                      setPrice(product.price || "");
                      setCategory(product.category || "");
                      setSortOrder(
                        String(product.sort_order ?? 0)
                      );
                      setOptions(product.options || "");
                      setDescription(
                        product.description || ""
                      );
                      setIsActive(
                        product.is_active !== false
                      );
                      setIsSoldOut(
                        product.is_sold_out === true
                      );

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="rounded-full bg-[#b58b6b] py-3 text-sm text-white"
                  >
                    編輯
                  </button>

                  <button
                    onClick={() =>
                      deleteProduct(product.id)
                    }
                    className="rounded-full bg-red-500 py-3 text-sm text-white"
                  >
                    刪除
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      toggleActive(product.id, active)
                    }
                    className="rounded-full border py-3 text-sm"
                  >
                    {active ? "下架" : "上架"}
                  </button>

                  <button
                    onClick={() =>
                      toggleSoldOut(product.id, soldOut)
                    }
                    className="rounded-full border py-3 text-sm"
                  >
                    {soldOut
                      ? "恢復販售"
                      : "設為售完"}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border p-6 text-center text-gray-500">
              找不到商品
            </div>
          )}
        </div>
      </div>
    </main>
  );
}