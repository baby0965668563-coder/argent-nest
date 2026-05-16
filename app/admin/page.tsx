"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

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

  useEffect(() => {
    const saved = localStorage.getItem("argent_admin_login");

    if (saved === "true") {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    const password = prompt("請輸入後台密碼");

    if (password === "argentnest520") {
      localStorage.setItem("argent_admin_login", "true");
      setAuthorized(true);
    } else {
      alert("密碼錯誤 ☁️");
    }

    setChecking(false);
  }, []);

  useEffect(() => {
    if (authorized) {
      fetchProducts();
    }
  }, [authorized]);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: false });

    setProducts(data || []);
  }

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

    if (error) return alert("新增失敗：" + error.message);

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

    if (error) return alert("修改失敗：" + error.message);

    alert("修改成功！");
    resetForm();
    fetchProducts();
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) return alert("狀態修改失敗：" + error.message);

    fetchProducts();
  }

  async function toggleSoldOut(id: number, currentStatus: boolean) {
    const { error } = await supabase
      .from("products")
      .update({ is_sold_out: !currentStatus })
      .eq("id", id);

    if (error) return alert("售完狀態修改失敗：" + error.message);

    fetchProducts();
  }

  async function deleteProduct(id: number) {
    if (!confirm("確定要刪除這個商品嗎？")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) return alert("刪除失敗：" + error.message);

    alert("刪除成功");
    fetchProducts();
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] text-black">
        驗證中...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] text-black">
        無權限 ☁️
      </main>
    );
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

        <button
          onClick={() => {
            localStorage.removeItem("argent_admin_login");
            location.reload();
          }}
          className="rounded-full border px-4 py-2 text-sm"
        >
          登出
        </button>
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
            placeholder="商品排序"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />

          <textarea
            className="w-full rounded-2xl border p-4"
            placeholder={`顏色：奶油白、黑色

尺寸：S、M、L`}
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
            <span>{isActive ? "上架中" : "已下架"}</span>

            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border p-4">
            <span>{isSoldOut ? "已售完" : "可下單"}</span>

            <input
              type="checkbox"
              checked={isSoldOut}
              onChange={(e) => setIsSoldOut(e.target.checked)}
            />
          </label>

          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full rounded-2xl border p-4"
            onChange={(e) =>
              setImages(Array.from(e.target.files || []))
            }
          />

          {images.length > 0 && (
            <div className="rounded-2xl bg-[#f8f5f2] p-4">
              <p className="mb-3 text-sm text-gray-600">
                已選擇 {images.length} 張圖片
              </p>

              <div className="grid grid-cols-3 gap-3">
                {images.map((file, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl bg-white"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {editingId && (
            <button
              onClick={resetForm}
              className="w-full rounded-full border py-4 text-gray-600"
            >
              取消編輯
            </button>
          )}
        </div>
      </div>
    </main>
  );
}