"use client";

import { useEffect, useState } from "react";
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
  const [description, setDescription] = useState("");
  const [productNote, setProductNote] = useState("");

  const [variantMode, setVariantMode] = useState<"dynamic" | "quick">("dynamic");
  const [quickVariantsText, setQuickVariantsText] = useState("");
  const [dynamicVariants, setDynamicVariants] = useState<string[]>([""]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [isActive, setIsActive] = useState(true);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);
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

    if (password === "argentnest520" || password === "argentnest0223") {
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
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("id", { ascending: false });

    if (error) {
      alert("讀取商品失敗：" + error.message);
      return;
    }

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

  function addDynamicVariantField() {
    setDynamicVariants([...dynamicVariants, ""]);
  }

  function updateDynamicVariant(index: number, value: string) {
    const updated = [...dynamicVariants];
    updated[index] = value;
    setDynamicVariants(updated);
  }

  function removeDynamicVariant(index: number) {
    const updated = dynamicVariants.filter((_, i) => i !== index);
    setDynamicVariants(updated.length > 0 ? updated : [""]);
  }

  function generateVariants() {
    const names =
      variantMode === "quick"
        ? quickVariantsText
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
        : dynamicVariants.map((item) => item.trim()).filter(Boolean);

    if (names.length === 0) {
      alert("請至少輸入一個款式");
      return;
    }

    const generated = names.map((variantName) => ({
      name: variantName,
      price: Number(price || 0),
      vipPrice: Number(vipPrice || 0) || null,
      stock: Number(stock || 0),
    }));

    setVariants(generated);
  }

  function updateVariant(index: number, field: keyof Variant, value: string) {
    const updated = [...variants];

    updated[index] = {
      ...updated[index],
      [field]: field === "name" ? value : Number(value || 0),
    };

    setVariants(updated);
  }

  function removeVariant(index: number) {
    if (!confirm("確定刪除此款式？")) return;
    setVariants(variants.filter((_, i) => i !== index));
  }

  function resetForm() {
    setName("");
    setPrice("");
    setVipPrice("");
    setCategory("");
    setSortOrder("0");
    setStock("0");
    setDescription("");
    setProductNote("");
    setVariantMode("dynamic");
    setQuickVariantsText("");
    setDynamicVariants([""]);
    setVariants([]);
    setIsActive(true);
    setIsSoldOut(false);
    setIsFeatured(false);
    setImages([]);
    setEditingImages([]);
    setEditingId(null);
  }

  function startEdit(product: any) {
    setEditingId(product.id);
    setName(product.name || "");
    setPrice(String(product.price || ""));
    setVipPrice(String(product.vip_price || ""));
    setCategory(product.category || "");
    setSortOrder(String(product.sort_order || 0));
    setStock(String(product.stock || 0));
    setDescription(product.description || "");
    setProductNote("");

    const oldVariants = Array.isArray(product.variants) ? product.variants : [];
    setVariants(oldVariants);

    const variantNames = oldVariants.map((variant: any) => variant.name || "");
    setDynamicVariants(variantNames.length > 0 ? variantNames : [""]);
    setQuickVariantsText(variantNames.join("\n"));
    setVariantMode("dynamic");

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

            resolve(
              new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
                type: "image/jpeg",
              })
            );
          },
          "image/jpeg",
          0.82
        );
      };

      image.src = URL.createObjectURL(file);
    });
  }

  async function uploadOneImage(file: File) {
    const compressedFile = await compressImage(file);
    const fileName = `${crypto.randomUUID()}.jpg`;

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

  function getSpecValuesFromVariants() {
    return variants.map((variant) => variant.name).filter(Boolean);
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
        price: Number(price || 0),
        vip_price: vipPrice ? Number(vipPrice) : null,
        category,
        sort_order: Number(sortOrder) || 0,
        stock: Number(stock) || 0,
        description,

        spec1_name: "款式",
        spec1_values: getSpecValuesFromVariants(),

        variants,

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
        price: Number(price || 0),
        vip_price: vipPrice ? Number(vipPrice) : null,
        category,
        sort_order: Number(sortOrder) || 0,
        stock: Number(stock) || 0,
        description,

        spec1_name: "款式",
        spec1_values: getSpecValuesFromVariants(),

        variants,

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

  async function toggleActive(id: string | number, currentStatus: boolean) {
    const { error } = await supabase
      .from("products")
      .update({
        is_active: !currentStatus,
      })
      .eq("id", id);

    if (error) return alert("上下架失敗：" + error.message);

    fetchProducts();
  }

  async function toggleSoldOut(id: string | number, currentStatus: boolean) {
    const { error } = await supabase
      .from("products")
      .update({
        is_sold_out: !currentStatus,
      })
      .eq("id", id);

    if (error) return alert("售完狀態修改失敗：" + error.message);

    fetchProducts();
  }

  async function toggleFeatured(id: string | number, currentStatus: boolean) {
    const { error } = await supabase
      .from("products")
      .update({
        is_featured: !currentStatus,
      })
      .eq("id", id);

    if (error) return alert("推薦狀態修改失敗：" + error.message);

    fetchProducts();
  }

  async function deleteProduct(id: string | number) {
    if (!confirm("確定要刪除這個商品嗎？")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) return alert("刪除失敗：" + error.message);

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
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#a08060]">
            ADMIN
          </p>

          <h1 className="text-3xl font-bold text-[#4b4038]">
            商品管理後台 ☁️
          </h1>

          <p className="mt-2 text-sm text-gray-500">Argent Nest 商品管理</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/admin/orders"
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            訂單後台
          </a>

          <a
            href="/"
            className="rounded-full border border-[#d8c5b0] bg-white px-4 py-2 text-sm text-[#6b5c50]"
          >
            回首頁
          </a>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("argent_admin_login");
              location.reload();
            }}
            className="rounded-full bg-[#2e2e2e] px-4 py-2 text-sm text-white"
          >
            登出
          </button>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-[#4b4038]">
          {editingId ? "編輯商品" : "新增商品"}
        </h2>

        <div className="space-y-4">
          <input
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder="商品名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder="商品基礎價格，例如 390"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder="VIP 基礎價格，可不填"
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
            placeholder="預設庫存，生成款式時會套用"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <div className="rounded-3xl border border-[#ece3d7] bg-[#faf7f2] p-5">
            <h3 className="mb-4 text-lg font-semibold text-[#4b4038]">
              款式建立
            </h3>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-full bg-white p-1">
              <button
                type="button"
                onClick={() => setVariantMode("dynamic")}
                className={`rounded-full py-3 text-sm ${
                  variantMode === "dynamic"
                    ? "bg-black text-white"
                    : "text-[#6b5c50]"
                }`}
              >
                動態新增
              </button>

              <button
                type="button"
                onClick={() => setVariantMode("quick")}
                className={`rounded-full py-3 text-sm ${
                  variantMode === "quick"
                    ? "bg-black text-white"
                    : "text-[#6b5c50]"
                }`}
              >
                快速貼上
              </button>
            </div>

            {variantMode === "dynamic" ? (
              <div className="space-y-3">
                {dynamicVariants.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      className="flex-1 rounded-2xl border border-[#ddd] bg-white p-3 text-sm text-[#333]"
                      placeholder={`款式 ${index + 1}，例如：變裝款｜烤焦熊`}
                      value={item}
                      onChange={(e) =>
                        updateDynamicVariant(index, e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeDynamicVariant(index)}
                      className="rounded-2xl bg-red-500 px-4 text-sm text-white"
                    >
                      刪除
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDynamicVariantField}
                  className="w-full rounded-full border border-[#d8c5b0] bg-white py-3 text-sm text-[#6b5c50]"
                >
                  ＋ 新增一個款式
                </button>
              </div>
            ) : (
              <textarea
                className="min-h-[180px] w-full rounded-2xl border border-[#ddd] bg-white p-3 text-sm text-[#333]"
                placeholder={`一行一個款式：
變裝款｜烤焦熊
變裝款｜牛仔藍格
變裝款｜櫻桃小狗🍒`}
                value={quickVariantsText}
                onChange={(e) => setQuickVariantsText(e.target.value)}
              />
            )}

            <button
              type="button"
              onClick={generateVariants}
              className="mt-4 w-full rounded-full bg-black py-3 text-sm text-white"
            >
              生成款式
            </button>
          </div>

          <div className="rounded-3xl border border-[#ece3d7] bg-[#faf7f2] p-5">
            <h3 className="mb-4 text-lg font-semibold text-[#4b4038]">
              款式價格 / VIP / 庫存
            </h3>

            {variants.length === 0 ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-gray-500">
                尚未生成 variants
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

                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="mt-3 rounded-full bg-red-500 px-4 py-2 text-sm text-white"
                    >
                      刪除此款式
                    </button>
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

          <textarea
            className="w-full rounded-2xl border border-[#ddd] bg-white p-4 text-[#333]"
            placeholder="後台暫存備註，不會寫入資料庫"
            value={productNote}
            onChange={(e) => setProductNote(e.target.value)}
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
            <span>{isSoldOut ? "已售完 / 不可下單" : "可下單"}</span>
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

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {editingImages.map((img, index) => (
                  <div key={img} className="overflow-hidden rounded-2xl bg-white">
                    <img
                      src={img}
                      className="aspect-square w-full object-cover"
                      alt=""
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

              <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                {images.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    className="aspect-square w-full rounded-xl object-cover"
                    alt=""
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={editingId ? updateProduct : addProduct}
            disabled={loading}
            className="w-full rounded-full bg-black py-4 text-white disabled:opacity-50"
          >
            {loading ? "處理中..." : editingId ? "儲存修改" : "新增商品"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full rounded-full border py-4 text-gray-600"
            >
              取消編輯
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-[32px] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-[#4b4038]">商品列表</h2>

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

            const itemVariants = Array.isArray(product.variants)
              ? product.variants
              : [];

            const active = product.is_active !== false;
            const soldOut = product.is_sold_out === true;

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
                        alt=""
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-[#4b4038]">{product.name}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      {product.category}
                    </p>

                    <p className="mt-1 font-bold">
                      NT$ {Number(product.price || 0).toLocaleString()}
                    </p>

                    {product.vip_price && (
                      <p className="mt-1 text-xs font-semibold text-[#b07255]">
                        VIP NT${" "}
                        {Number(product.vip_price || 0).toLocaleString()}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.is_featured && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                          HOT 推薦
                        </span>
                      )}

                      {soldOut && (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                          已售完
                        </span>
                      )}

                      {!active && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-600">
                          已下架
                        </span>
                      )}
                    </div>

                    {itemVariants.length > 0 && (
                      <div className="mt-3 rounded-2xl bg-[#f8f5f2] p-3">
                        <p className="mb-2 text-xs font-bold text-[#6b5c50]">
                          款式價格
                        </p>

                        <div className="space-y-1">
                          {itemVariants
                            .slice(0, 8)
                            .map((variant: any, index: number) => (
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

                          {itemVariants.length > 8 && (
                            <p className="text-xs text-gray-400">
                              還有 {itemVariants.length - 8} 個款式...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(product.id, active)}
                    className="rounded-full border py-2 text-sm"
                  >
                    {active ? "下架" : "上架"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSoldOut(product.id, soldOut)}
                    className="rounded-full border py-2 text-sm"
                  >
                    {soldOut ? "改可下單" : "改售完"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleFeatured(product.id, product.is_featured === true)
                    }
                    className="rounded-full border border-yellow-400 py-2 text-sm text-yellow-700"
                  >
                    {product.is_featured ? "取消推薦" : "設為推薦"}
                  </button>

                  <button
                    type="button"
                    onClick={() => startEdit(product)}
                    className="rounded-full bg-[#3f332b] py-2 text-sm text-white"
                  >
                    編輯
                  </button>

                  <button
                    type="button"
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