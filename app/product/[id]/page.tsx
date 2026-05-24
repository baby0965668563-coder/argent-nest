"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/app/components/AddToCartButton";
import LikeButton from "@/app/components/LikeButton";

type Variant = {
  name: string;
  price: number;
  vipPrice?: number | null;
  stock?: number;
};

export default function ProductPage() {
  const params = useParams();

  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariantName, setSelectedVariantName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();

    const savedUser = localStorage.getItem("argent_user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("argent_user");
      }
    }
  }, []);

  async function fetchProduct() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setProduct(data);

    const imgs =
      typeof data?.images === "string"
        ? data.images
            .split(",")
            .map((img: string) => img.trim())
            .filter(Boolean)
        : Array.isArray(data?.images)
        ? data.images
        : [];

    if (imgs.length > 0) {
      setSelectedImage(imgs[0]);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <p className="text-gray-500">商品載入中...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <p className="text-gray-500">找不到商品</p>
      </main>
    );
  }

  const isVip = user?.is_vip === true || user?.level === "vip";

  const images =
    typeof product.images === "string"
      ? product.images
          .split(",")
          .map((img: string) => img.trim())
          .filter(Boolean)
      : Array.isArray(product.images)
      ? product.images
      : [];

  const variants: Variant[] = Array.isArray(product.variants)
    ? product.variants
    : [];

  const hasVariants = variants.length > 0;

  const selectedVariant = variants.find(
    (variant) => variant.name === selectedVariantName
  );

  const productStock = Number(product.stock || 0);
  const variantStock = Number(selectedVariant?.stock || 0);

  const productSoldOut = product.is_sold_out === true;
  const variantSoldOut = selectedVariant ? variantStock <= 0 : false;

  const isSoldOut = productSoldOut || variantSoldOut;

  const originalPrice = selectedVariant
    ? Number(selectedVariant.price || 0)
    : Number(product.price || 0);

  const vipPrice = selectedVariant
    ? Number(selectedVariant.vipPrice || 0)
    : Number(product.vip_price || 0);

  const displayPrice = isVip && vipPrice > 0 ? vipPrice : originalPrice;

  const selectedOptions: Record<string, string> = selectedVariantName
  ? {
      款式: selectedVariantName,
    }
  : {};

  const disabled = productSoldOut || (hasVariants && !selectedVariant) || isSoldOut;

  function renderStockBadge() {
    if (productSoldOut) {
      return (
        <div className="mt-3 inline-flex rounded-full bg-gray-200 px-4 py-2 text-xs font-medium text-gray-600">
          SOLD OUT 已售完
        </div>
      );
    }

    if (hasVariants && !selectedVariant) {
      return (
        <div className="mt-3 inline-flex rounded-full bg-[#f6efe7] px-4 py-2 text-xs font-medium text-[#8c7b70]">
          請先選擇款式 ☁️
        </div>
      );
    }

    if (variantSoldOut) {
      return (
        <div className="mt-3 inline-flex rounded-full bg-gray-200 px-4 py-2 text-xs font-medium text-gray-600">
          此款式已售完
        </div>
      );
    }

    const currentStock = hasVariants ? variantStock : productStock;

    if (currentStock > 0) {
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-xs font-medium text-green-700">
            現貨 {currentStock} 件
          </span>

          {currentStock <= 3 && (
            <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-xs font-medium text-red-600">
              庫存不多了 ☁️
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="mt-3 inline-flex rounded-full bg-[#fff2e5] px-4 py-2 text-xs font-medium text-[#b07255]">
        預購商品 ☁️
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-gray-400">
                無商品圖片
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {images.map((img: string) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border ${
                    selectedImage === img
                      ? "border-[#4b4038]"
                      : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm text-gray-400">
                {product.category || "Argent Nest Select"}
              </p>

              <h1 className="text-2xl font-semibold leading-relaxed text-[#4b4038]">
                {product.name}
              </h1>
            </div>

            <LikeButton
              productId={product.id}
              initialLikes={Number(product.likes || 0)}
            />
          </div>

          <div className="mt-5">
            <p className="text-2xl font-semibold text-[#4b4038]">
              NT$ {displayPrice.toLocaleString()}
            </p>

            {isVip && vipPrice > 0 && originalPrice > vipPrice && (
              <>
                <p className="mt-2 text-sm font-medium text-[#b07255]">
                  VIP 會員價已套用 ☁️
                </p>

                <p className="mt-1 text-sm text-gray-400 line-through">
                  原價 NT$ {originalPrice.toLocaleString()}
                </p>
              </>
            )}

            {!isVip && vipPrice > 0 && (
              <p className="mt-2 text-sm font-medium text-[#b07255]">
                VIP NT$ {vipPrice.toLocaleString()}
              </p>
            )}

            {renderStockBadge()}

            {selectedVariant && (
              <p className="mt-2 text-sm text-[#8c7b70]">
                已選：{selectedVariant.name}
              </p>
            )}
          </div>

          {hasVariants && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-[#6b5c50]">款式</p>

                {selectedVariant && (
                  <button
                    type="button"
                    onClick={() => setSelectedVariantName("")}
                    className="text-xs text-gray-400 underline"
                  >
                    重新選擇
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {variants.map((variant) => {
                  const stock = Number(variant.stock || 0);
                  const soldOut = stock <= 0;
                  const selected = selectedVariantName === variant.name;

                  return (
                    <button
                      key={variant.name}
                      type="button"
                      disabled={soldOut}
                      onClick={() => setSelectedVariantName(variant.name)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        soldOut
                          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                          : selected
                          ? "border-[#2e2e2e] bg-[#2e2e2e] text-white"
                          : "border-[#d8c5b0] bg-white text-[#6b5c50] hover:bg-[#f8f3ee]"
                      }`}
                    >
                      <div className="font-medium">{variant.name}</div>

                      <div
                        className={`mt-1 text-xs ${
                          selected ? "text-white/75" : "text-[#8c7b70]"
                        }`}
                      >
                        NT$ {Number(variant.price || 0).toLocaleString()}
                        {variant.vipPrice
                          ? `｜VIP NT$ ${Number(
                              variant.vipPrice || 0
                            ).toLocaleString()}`
                          : ""}
                      </div>

                      <div
                        className={`mt-1 text-xs ${
                          soldOut
                            ? "text-gray-400"
                            : selected
                            ? "text-white/75"
                            : stock <= 3
                            ? "text-red-500"
                            : "text-green-700"
                        }`}
                      >
                        {soldOut
                          ? "已售完"
                          : stock > 0
                          ? stock <= 3
                            ? `剩 ${stock} 件`
                            : `現貨 ${stock} 件`
                          : "預購"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-[#6b5c50]">商品備註</p>

            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="有想備註的地方可以寫這裡，例如：送禮用、指定出貨提醒"
              className="min-h-[96px] w-full resize-none rounded-3xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
            />
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-3 font-semibold text-[#4b4038]">商品描述</h2>

              <p className="whitespace-pre-line leading-7 text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton
              soldOut={Boolean(isSoldOut)}
              product={{
                ...product,
                finalPrice: displayPrice,
                originalPrice,
                finalVipPrice: vipPrice,
                isVipPrice: isVip && vipPrice > 0 && originalPrice > vipPrice,
                selectedVariant: selectedVariant || null,
              }}
              selectedOptions={selectedOptions}
              customerNote={customerNote}
              disabled={disabled}
            />

            {hasVariants && !selectedVariant && !productSoldOut && (
              <p className="mt-2 text-center text-xs text-[#9b6b4f]">
                請先選擇商品款式
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
