"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [options, setOptions] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  function resetForm() {
    setName("");
    setPrice("");
    setCategory("");
    setSortOrder("0");
    setOptions("");
    setDescription("");
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

  async function deleteProduct(id: number) {
    if (!confirm("確定要刪除這個商品嗎？")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

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

        <a href="/" className="rounded-full border px-4 py-2 text-sm">
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
            placeholder={"商品規格，例如：\n顏色|奶油白,黑色\n尺寸|S,M,L\n款式|A款,B款"}
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />

          <textarea
            className="w-full rounded-2xl border p-4"
            placeholder="商品描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {editingId && editingImages.length > 0 && (
            <div className="rounded-2xl bg-[#f8f5f2] p-4">
              <p className="mb-3 text-sm text-gray-600">目前圖片</p>

              <div className="grid grid-cols-4 gap-3">
                {editingImages.map((img, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl bg-white"
                  >
                    <img
                      src={img}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {images.length > 0 && (
            <div className="rounded-2xl bg-[#f8f5f2] p-4 text-sm text-gray-600">
              已選擇 {images.length} 張新圖片
              {editingId && "，儲存後會取代原本圖片"}
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
        <h2 className="mb-5 text-xl font-bold">商品清單</h2>

        <div className="space-y-4">
          {products.map((product) => {
            const productImages =
              product.images && product.images.length > 0
                ? product.images
                : product.image
                ? [product.image]
                : [];

            return (
  <div
    key={product.id}
    className="rounded-2xl border p-4"
  >
    <div className="flex gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-bold">
          {product.name}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          NT$ {product.price}
        </p>

        <p className="mt-1 text-xs text-[#b58b6b]">
          {product.category}｜排序 {product.sort_order ?? 0}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          圖片 {productImages.length} 張
        </p>

        {product.options && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-400">
            規格：{product.options}
          </p>
        )}
      </div>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <button
        onClick={() => {
          setEditingId(product.id);
          setName(product.name || "");
          setPrice(product.price || "");
          setCategory(product.category || "");
          setSortOrder(String(product.sort_order ?? 0));
          setOptions(product.options || "");
          setDescription(product.description || "");
          setEditingImages(productImages);
          setImages([]);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="rounded-full bg-[#b58b6b] py-3 text-sm text-white"
      >
        編輯
      </button>

      <button
        onClick={() => deleteProduct(product.id)}
        className="rounded-full bg-red-500 py-3 text-sm text-white"
      >
        刪除
      </button>
    </div>
  </div>
);
          {products.length === 0 && (
            <div className="rounded-2xl border p-6 text-center text-gray-500">
              目前還沒有商品
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
