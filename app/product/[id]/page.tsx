"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/app/components/AddToCartButton";
import LikeButton from "@/app/components/LikeButton";

type OptionGroup = {
  name: string;
  values: string[];
};

function parseOptions(optionsText: string): OptionGroup[] {
  if (!optionsText) return [];

  return optionsText
    .split("\n")
    .map((line) => {
      const parts = line.includes("|") ? line.split("|") : line.split("｜");

      if (parts.length < 2) return null;

      return {
        name: parts[0].trim(),
        values: parts
          .slice(1)
          .join("｜")
          .split(/[、,，]/)
          .map((v) => v.trim())
          .filter(Boolean),
      };
    })
    .filter((item): item is OptionGroup => item !== null);
}

export default function ProductPage() {
  const params = useParams();

  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
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
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <p className="text-gray-500">商品載入中...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
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

  const optionGroups = parseOptions(product.options || "");

  const variants = Array.isArray(product.variants) ? product.variants : [];

  const variantGroup =
    variants.length > 0
      ? {
          name: "款式",
          values: variants.map((v: any) => v.name),
        }
      : null;

  const allOptionGroups = variantGroup ? [variantGroup, ...optionGroups] : optionGroups;

  const selectedVariant = variants.find(
    (v: any) => v.name === selectedOptions["款式"]
  );

  const productStock = Number(product.stock || 0);
  const variantStock = Number(selectedVariant?.stock || 0);

  const hasVariants = variants.length > 0;

  const currentStock = hasVariants
    ? selectedVariant
      ? variantStock
      : null
    : productStock;

  const productSoldOut = product.is_sold_out === true;
  const variantSoldOut = selectedVariant && variantStock <= 0;

  const isSoldOut = productSoldOut || Boolean(variantSoldOut);

  const originalPrice = selectedVariant
    ? Number(selectedVariant.price || 0)
    : Number(product.price || 0);

  const vipPrice = selectedVariant
    ? Number(selectedVariant.vipPrice || 0)
    : Number(product.vip_price || 0);

  const displayPrice = isVip && vipPrice > 0 ? vipPrice : originalPrice;

  const hasMissingOptions =
    allOptionGroups.some((group) => !selectedOptions[group.name]) ||
    Boolean(isSoldOut);

  function renderStockBadge() {
    if (productSoldOut || variantSoldOut) {
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

    if (currentStock && currentStock > 0) {
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
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-gray-400">
                無商品圖片
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {images.map((img: string) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border ${
                    selectedImage === img
                      ? "border-[#4b4038]"
                      : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">
                {product.category || "Argent Nest Select"}
              </p>

              <h1 className="text-2xl font-semibold leading-relaxed text-[#4b4038]">
                {product.name}
              </h1>
            </div>

            <LikeButton productId={product.id} />
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
                此款剩餘庫存：{variantStock}
              </p>
            )}
          </div>

          {allOptionGroups.length > 0 && (
            <div className="mt-6 space-y-5">
              {allOptionGroups.map((group) => (
                <div key={group.name}>
                  <p className="font-semibold mb-3 text-[#6b5c50]">
                    {group.name}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value: string) => {
                      const selected = selectedOptions[group.name] === value;

                      const variantOption = variants.find(
                        (v: any) => group.name === "款式" && v.name === value
                      );

                      const optionSoldOut =
                        group.name === "款式" &&
                        variantOption &&
                        Number(variantOption.stock || 0) <= 0;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setSelectedOptions({
                              ...selectedOptions,
                              [group.name]: value,
                            })
                          }
                          disabled={Boolean(optionSoldOut)}
                          className={`px-4 py-2 rounded-full border text-sm transition ${
                            optionSoldOut
                              ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                              : selected
                              ? "bg-[#2e2e2e] text-white border-[#2e2e2e]"
                              : "bg-white text-[#6b5c50] border-[#d8c5b0]"
                          }`}
                        >
                          {value}
                          {optionSoldOut ? "｜售完" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-[#6b5c50]">
              商品備註
            </p>

            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="有想備註的地方可以寫這裡，例如：送禮用、不要太甜、指定款式提醒"
              className="min-h-[96px] w-full resize-none rounded-3xl border border-[#e1d3c2] bg-white px-4 py-3 text-sm text-[#4b4038] outline-none placeholder:text-gray-400"
            />
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="font-semibold mb-3 text-[#4b4038]">
                商品描述
              </h2>

              <p className="text-gray-600 leading-7 whitespace-pre-line">
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
                selectedVariant,
              }}
              selectedOptions={selectedOptions}
              customerNote={customerNote}
              disabled={hasMissingOptions}
            />

            {hasMissingOptions && !isSoldOut && (
              <p className="mt-2 text-center text-xs text-[#9b6b4f]">
                請先選擇商品規格
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}