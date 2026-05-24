"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

type Variant = {
  name: string;
  price: number;
  vipPrice?: number | null;
  stock?: number;
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [stock, setStock] = useState("0");
  const [options, setOptions] = useState("");
  const [description, setDescription] = useState("");

  const [variants, setVariants] = useState<Variant[]>([]);

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
      .order("is_featured", { ascending: false })
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
    setVipPrice("");
    setCategory("");
    setSortOrder("0");
    setStock("0");
    setOptions("");
    setDescription("");
    setVariants([]);
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
    setVipPrice(String(product.vip_price || ""));
    setCategory(product.category || "");
    setSortOrder(String(product.sort_order || 0));
    setStock(String(product.stock || 0));
    setOptions(product.options || "");
    setDescription(product.description || "");
    setVariants(Array.isArray(product.variants) ? product.variants : []);
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function removeEditingImage(index: number) {
    setEditingImages(editingImages.filter((_, i) => i !== index));
  }

  function setCoverImage(index: number) {
    const selected = editingImages[index];
    const others = editingImages.filter((_, i) => i !== index);
    setEditingImages([selected, ...others]);
  }

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 1200;
        const scale = maxWidth / image.width;

        canvas.width = image.width > maxWidth ? maxWidth : image.width;
        canvas.height =
          image.width > maxWidth ? image.height * scale : image.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const compressed = new File(
              [blob],
              file.name.replace(/\.\w+$/, ".jpg"),
              { type: "image/jpeg" }
            );

            resolve(compressed);
          },
          "image/jpeg",
          0.8
        );
      };

      image.src = URL.createObjectURL(file);
    });
  }

  async function uploadOneImage(file: File) {
    const compressedFile = await compressImage(file);

    const fileName = `${uuidv4()}.jpg`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, compressedFile, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
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

  function addVariant() {
    setVariants([
      ...variants,
      {
        name: "",
        price: 0,
        vipPrice: 0,
        stock: 0,
      },
    ]);
  }

  function updateVariant(index: number, field: string, value: string) {
    const updated = [...variants];

    updated[index] = {
      ...updated[index],
      [field]: field === "name" ? value : Number(value || 0),
    };

    setVariants(updated);
  }

  function removeVariant(index: number) {
    const ok = confirm("確定刪除此款式？");

    if (!ok) return;

    setVariants(variants.filter((_, i) => i !== index));
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
        vip_price: vipPrice || null,
        category,
        sort_order: Number(sortOrder) || 0,
        stock: Number(stock) || 0,
        options,
        variants,
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
        vip_price: vipPrice || null,
        category,
        sort_order: Number(sortOrder) || 0,
        stock: Number(stock) || 0,
        options,
        variants,
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
    await supabase
      .from("products")
      .update({
        is_active: !currentStatus,
      })
      .eq("id", id);

    fetchProducts();
  }

  async function toggleSoldOut(id: number, currentStatus: boolean) {
    await supabase
      .from("products")
      .update({
        is_sold_out: !currentStatus,
      })
      .eq("id", id);

    fetchProducts();
  }

  async function toggleFeatured(id: number, currentStatus: boolean) {
    await supabase
      .from("products")
      .update({
        is_featured: !currentStatus,
      })
      .eq("id", id);

    fetchProducts();
  }

  async function deleteProduct(id: number) {
    if (!confirm("確定要刪除這個商品嗎？")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("刪除失敗：" + error.message);
      return;
    }

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
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">管理後台</h1>

          <p className="mt-2 text-sm text-gray-500">
            Argent Nest 商品管理
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/admin/orders"
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            訂單後台
          </a>

          <a
            href="/admin/users"
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            會員管理
          </a>

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
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">
          {editingId ? "編輯商品" : "新增商品"}
        </h2>

        <div className="space-y-4">
          <input
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333] placeholder:text-gray-400"
            placeholder="商品名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder="價格"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder="VIP 價格"
            value={vipPrice}
            onChange={(e) => setVipPrice(e.target.value)}
          />

          <select
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
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
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder="商品排序"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder="總庫存"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <textarea
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder={`規格格式：
顏色|奶油白,黑色
尺寸|S,M,L`}
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />

          <div className="rounded-3xl border border-[#ece3d7] bg-[#faf7f2] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#4b4038]">
                款式 Variants
              </h3>

              <button
                type="button"
                onClick={addVariant}
                className="rounded-full bg-black px-4 py-2 text-sm text-white"
              >
                新增款式
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-gray-500">
                尚未新增 variants
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="rounded-2xl bg-white p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                      <input
                        value={variant.name}
                        onChange={(e) =>
                          updateVariant(index, "name", e.target.value)
                        }
                        placeholder="款式名稱"
                        className="rounded-2xl border border-[#ddd] p-3 text-sm"
                      />

                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(index, "price", e.target.value)
                        }
                        placeholder="一般價格"
                        className="rounded-2xl border border-[#ddd] p-3 text-sm"
                      />

                      <input
                        type="number"
                        value={variant.vipPrice || 0}
                        onChange={(e) =>
                          updateVariant(index, "vipPrice", e.target.value)
                        }
                        placeholder="VIP價格"
                        className="rounded-2xl border border-[#ddd] p-3 text-sm"
                      />

                      <input
                        type="number"
                        value={variant.stock || 0}
                        onChange={(e) =>
                          updateVariant(index, "stock", e.target.value)
                        }
                        placeholder="庫存"
                        className="rounded-2xl border border-[#ddd] p-3 text-sm"
                      />
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="rounded-full bg-red-500 px-4 py-2 text-sm text-white"
                      >
                        刪除此款式
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <textarea
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
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
                    <img
                      src={img}
                      className="aspect-square w-full object-cover"
                    />

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
          className="mb-5 w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
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

            const variants = Array.isArray(product.variants)
              ? product.variants
              : [];

            return (
              <div
                key={product.id}
                className="rounded-2xl border bg-[#fffdfb] p-4"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#eee5dc]">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        className="h-full w-full object-cover"
                      />
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

                    {product.vip_price && (
                      <p className="mt-1 text-xs font-semibold text-[#b07255]">
                        VIP NT$ {Number(product.vip_price || 0).toLocaleString()}
                      </p>
                    )}

                    {variants.length > 0 && (
                      <div className="mt-3 rounded-2xl bg-[#f8f5f2] p-3">
                        <p className="mb-2 text-xs font-bold text-[#6b5c50]">
                          款式價格
                        </p>

                        <div className="space-y-1">
                          {variants.map((variant: any, index: number) => (
                            <p
                              key={`${variant.name}-${index}`}
                              className="text-xs text-[#6b5c50]"
                            >
                              {variant.name}｜NT${variant.price}
                              {variant.vipPrice
                                ? `｜VIP NT$ ${variant.vipPrice}`
                                : ""}
                              ｜庫存 {variant.stock}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

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