"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    setProducts(data || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function addProduct() {
    if (!image) return alert("請選擇圖片");

    const fileName = `${uuidv4()}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, image);

    if (uploadError) return alert("圖片上傳失敗：" + uploadError.message);

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    const { error } = await supabase.from("products").insert([
      {
        name,
        price,
        category,
        description,
        image: data.publicUrl,
      },
    ]);

    if (error) return alert("新增失敗：" + error.message);

    alert("新增成功！");
    resetForm();
    fetchProducts();
  }

  async function updateProduct() {
    if (!editingId) return;

    const { error } = await supabase
      .from("products")
      .update({ name, price, category, description })
      .eq("id", editingId);

    if (error) return alert("修改失敗：" + error.message);

    alert("修改成功！");
    resetForm();
    fetchProducts();
  }

  async function deleteProduct(id: number) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) return alert("刪除失敗：" + error.message);

    alert("刪除成功");
    fetchProducts();
  }

  function resetForm() {
    setName("");
    setPrice("");
    setCategory("");
    setDescription("");
    setImage(null);
    setEditingId(null);
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-6 py-10 text-[#3d3d3d]">
      <h1 className="mb-2 text-3xl font-bold">管理後台</h1>
      <p className="mb-8 text-gray-500">手機上架商品、改價格、管理商品。</p>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">
          {editingId ? "編輯商品" : "新增商品"}
        </h2>

        <div className="space-y-4">
          <input className="w-full rounded-2xl border p-4" placeholder="商品名稱" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded-2xl border p-4" placeholder="價格" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="w-full rounded-2xl border p-4" placeholder="商品分類" value={category} onChange={(e) => setCategory(e.target.value)} />
          <textarea className="w-full rounded-2xl border p-4" placeholder="商品描述" value={description} onChange={(e) => setDescription(e.target.value)} />

          {!editingId && (
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-2xl border p-4"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImage(file);
              }}
            />
          )}

          <button
            onClick={editingId ? updateProduct : addProduct}
            className="w-full rounded-full bg-black py-4 text-white"
          >
            {editingId ? "儲存修改" : "新增商品"}
          </button>

          {editingId && (
            <button onClick={resetForm} className="w-full rounded-full border py-4 text-gray-600">
              取消編輯
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">商品清單</h2>

        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="font-bold">{product.name}</p>
                <p className="text-sm text-gray-500">NT$ {product.price}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(product.id);
                    setName(product.name);
                    setPrice(product.price);
                    setCategory(product.category);
                    setDescription(product.description);
                  }}
                  className="rounded-full bg-[#b58b6b] px-4 py-2 text-sm text-white"
                >
                  編輯
                </button>

                <button
                  onClick={() => deleteProduct(product.id)}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm text-white"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}