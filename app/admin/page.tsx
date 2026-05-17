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
  const [isFeatured, setIsFeatured] = useState(false);
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
    if (authorized) fetchProducts();
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
    setIsFeatured(false);
    setImages([]);
    setEditingId(null);
    setEditingImages([]);
  }

  function startEdit(product: any) {
    setEditingId(product.id);
    setName(product.name || "");
    setPrice(String(product.price || ""));
    setCategory(product.category || "");
    setSortOrder(String(product.sort_order || 0));
    setOptions(product.options || "");
    setDescription(product.description || "");
    setIsActive(product.is_active !== false);
    setIsSoldOut(product.is_sold_out === true);
    setIsFeatured(product.is_featured === true);

    const oldImages =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];

    setEditingImages(oldImages);
    setImages([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeEditingImage(index: number) {
    setEditingImages(editingImages.filter((_, i) => i !== index));
  }

  function setCoverImage(index: number) {
    const selected = editingImages[index];
    const others = editingImages.filter((_, i) => i !== index);
    setEditingImages([selected, ...others]);
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

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);
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
        is_featured: isFeatured,
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
    if (!name) return alert("請輸入商品名稱");
    if (!price) return alert("請輸入價格");
    if (!category) return alert("請選擇商品分類");

    setLoading(true);

    let finalImages = [...editingImages];

    if (images.length > 0) {
      const uploadedUrls = await uploadImages(images);

      if (uploadedUrls.length === 0) {
        setLoading(false);
        return;
      }

      finalImages = [...finalImages, ...uploadedUrls];
    }

    if (finalImages.length === 0) {
      setLoading(false);
      return alert("請至少保留一張圖片");
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
        is_featured: isFeatured,
        image: finalImages[0] || "",
        images: finalImages,
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

  async function toggleFeatured(id: number, currentStatus: boolean) {
    const { error } = await supabase
      .from("products")
      .update({ is_featured: !currentStatus })
      .eq("id", id);

    if (error) return alert("推薦狀態修改失敗：" + error.message);
    fetchProducts();
  }

  async function deleteProduct(id: number) {
    if (!confirm("確定要刪除這個商品嗎？")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

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
          <p className="mt-2 text-sm text-gray-500">Argent Nest 商品管理</p>
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
            <option value="卡通療癒選物">卡通療癒選物</option>
            <option value="微辣韓系穿搭">微辣韓系穿搭</option>
            <option value="飾品包包">飾品包包</option>
            <option value="花束甜點">花束甜點</option>
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
            placeholder={`規格格式請這樣輸入：
顏色|奶油白,黑色
尺寸|S,M,L`}
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

          <label className="flex items-center justify-between rounded-2xl border p-4">
            <span>{isFeatured ? "⭐ 推薦商品" : "一般商品"}</span>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
          </label>

          {editingId && editingImages.length > 0 && (
            <div className="rounded-2xl bg-[#f8f5f2] p-4">
              <p className="mb-3 text-sm font-bold text-gray-700">
                目前商品圖片
              </p>

              <div className="grid grid-cols-2 gap-3">
                {editingImages.map((img, index) => (
                  <div key={img} className="overflow-hidden rounded-2xl bg-white">
                    <img src={img} className="aspect-square w-full object-cover" />

                    <div className="space-y-2 p-2">
                      {index === 0 ? (
                        <p className="rounded-full bg-black py-2 text-center text-xs text-white">
                          目前封面
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCoverImage(index)}
                          className="w-full rounded-full border py-2 text-xs text-[#6b5c50]"
                        >
                          設為封面
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeEditingImage(index)}
                        className="w-full rounded-full bg-red-500 py-2 text-xs text-white"
                      >
                        刪除圖片
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full rounded-2xl border p-4"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />

          {editingId && (
            <p className="text-xs leading-6 text-gray-500">
              編輯商品時，新選的圖片會加到原本圖片後面，不會覆蓋原圖片。
            </p>
          )}

          {images.length > 0 && (
            <div className="rounded-2xl bg-[#f8f5f2] p-4">
              <p className="mb-3 text-sm text-gray-600">
                已選擇新增 {images.length} 張圖片
              </p>

              <div className="grid grid-cols-3 gap-3">
                {images.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={editingId ? updateProduct : addProduct}
            disabled={loading}
            className="w-full rounded-full bg-black py-4 text-white disabled:opacity-50"
          >
            {loading ? "處理中..." : editingId ? "儲存修改" : "新增商品"}
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

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">商品列表</h2>

        <input
          className="mb-5 w-full rounded-2xl border p-4"
          placeholder="搜尋商品..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const imageSrc =
              product.image ||
              (Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : "");

            return (
              <div
                key={product.id}
                className="rounded-2xl border bg-[#fffdfb] p-4"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#eee5dc]">
                    {imageSrc ? (
                      <img src={imageSrc} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold">{product.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.category}
                    </p>
                    <p className="mt-1 font-bold">
                      NT$ {Number(product.price || 0).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      排序：{product.sort_order || 0}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.is_featured && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                          HOT 推薦
                        </span>
                      )}

                      {product.is_sold_out && (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                          已售完
                        </span>
                      )}

                      {product.is_active === false && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-600">
                          已下架
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      toggleActive(product.id, product.is_active !== false)
                    }
                    className="rounded-full border py-2 text-sm"
                  >
                    {product.is_active !== false ? "下架" : "上架"}
                  </button>

                  <button
                    onClick={() =>
                      toggleSoldOut(product.id, product.is_sold_out === true)
                    }
                    className="rounded-full border py-2 text-sm"
                  >
                    {product.is_sold_out ? "改可下單" : "改售完"}
                  </button>

                  <button
                    onClick={() =>
                      toggleFeatured(product.id, product.is_featured === true)
                    }
                    className="rounded-full border border-yellow-400 py-2 text-sm text-yellow-700"
                  >
                    {product.is_featured ? "取消推薦" : "設為推薦"}
                  </button>

                  <button
                    onClick={() => startEdit(product)}
                    className="rounded-full bg-[#3f332b] py-2 text-sm text-white"
                  >
                    編輯
                  </button>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="col-span-2 rounded-full bg-red-500 py-2 text-sm text-white"
                  >
                    刪除
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              目前沒有商品
            </p>
          )}
        </div>
      </div>
    </main>
  );
}