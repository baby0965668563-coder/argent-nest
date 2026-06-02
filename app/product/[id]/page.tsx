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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    fetchUser();
  }, []);

  async function fetchUser() {
    const savedUser = localStorage.getItem("argent_user");

    if (!savedUser) return;

    try {
      const parsed = JSON.parse(savedUser);
      const lineUserId = parsed.line_user_id || parsed.line_id;

      if (!lineUserId) {
        setUser(parsed);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("line_id", lineUserId)
        .single();

      if (data) {
        const mergedUser = {
          ...parsed,
          ...data,
          line_user_id: data.line_id || lineUserId,
        };

        localStorage.setItem("argent_user", JSON.stringify(mergedUser));
        setUser(mergedUser);
      } else {
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem("argent_user");
    }
  }

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

  const vipLevel = user?.vip_level || "NORMAL";
  const isVip = vipLevel === "VIP";

  const productInactive = product.is_active === false;
  const productSoldOut = product.is_sold_out === true;

  const saleType = product.sale_type || "instock";
  const isPreorder = saleType === "preorder";

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

  const allOptionGroups = variantGroup
    ? [variantGroup, ...optionGroups]
    : optionGroups;

  const selectedVariant = variants.find(
    (v: any) => v.name === selectedOptions["款式"]
  );

  const variantStock = Number(selectedVariant?.stock || 0);

  const variantSoldOut =
    selectedVariant &&
    variantStock <= 0 &&
    !isPreorder;

  const originalPrice = selectedVariant
    ? Number(selectedVariant.price || 0)
    : Number(product.price || 0);

  const vipPrice = selectedVariant
    ? Number(selectedVariant.vipPrice || 0)
    : Number(product.vip_price || 0);

  const displayPrice = isVip && vipPrice > 0 ? vipPrice : originalPrice;

  const disabled =
    productInactive ||
    productSoldOut ||
    allOptionGroups.some((group) => !selectedOptions[group.name]) ||
    Boolean(variantSoldOut);

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-gray-400">
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
                  className={`h-20 w-20 overflow-hidden rounded-2xl border ${
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

        <section className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm text-gray-400">
                {product.category || "Argent Nest"}
              </p>

              <h1 className="text-2xl font-semibold leading-relaxed text-[#4b4038]">
                {product.name}
              </h1>
            </div>

            <LikeButton productId={product.id} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {saleType === "instock" && (
              <span className="rounded-full bg-[#e9f7ef] px-3 py-1 text-xs font-medium text-[#2e7d32]">
                現貨商品
              </span>
            )}

            {saleType === "preorder" && (
              <span className="rounded-full bg-[#fff2e5] px-3 py-1 text-xs font-medium text-[#b07255]">
                預購商品
              </span>
            )}

            {saleType === "factory" && (
              <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-medium text-[#4f6596]">
                廠現商品
              </span>
            )}

            {productInactive && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                已下架
              </span>
            )}

            {productSoldOut && (
              <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                已售完
              </span>
            )}

            {isVip && (
              <span className="rounded-full bg-[#fff2e5] px-3 py-1 text-xs font-medium text-[#b07255]">
                VIP 價格已啟用 ☁️
              </span>
            )}
          </div>

          <div className="mt-5">
            <p className="text-2xl font-bold text-[#4b4038]">
              NT${displayPrice.toLocaleString()}
            </p>

            {isVip && vipPrice > 0 && originalPrice > vipPrice && (
              <>
                <p className="mt-2 text-sm font-medium text-[#b07255]">
                  VIP 會員價已套用 ☁️
                </p>

                <p className="mt-1 text-sm text-gray-400 line-through">
                  原價 NT${originalPrice.toLocaleString()}
                </p>
              </>
            )}

            {!isVip && vipPrice > 0 && (
              <p className="mt-2 text-sm font-medium text-[#b07255]">
                VIP NT${vipPrice.toLocaleString()}
              </p>
            )}

            {(saleType === "instock" || saleType === "factory") && selectedVariant && (
              <p className="mt-2 text-sm text-[#8c7b70]">
                剩餘庫存：{variantStock}
              </p>
            )}

            {saleType === "preorder" && (
              <p className="mt-2 text-sm font-medium text-[#b07255]">
                預購商品｜約 14–21 天，不含假日
              </p>
            )}

            {saleType === "factory" && (
              <p className="mt-2 text-sm font-medium text-[#4f6596]">
                廠現商品｜約 4–6 天
              </p>
            )}

            {variantSoldOut && (
              <p className="mt-2 text-sm font-semibold text-red-500">
                此款式已售完
              </p>
            )}
          </div>

          {allOptionGroups.length > 0 && (
            <div className="mt-6 space-y-5">
              {allOptionGroups.map((group) => (
                <div key={group.name}>
                  <p className="mb-3 font-semibold text-[#6b5c50]">
                    {group.name}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value: string) => {
                      const selected = selectedOptions[group.name] === value;

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
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            selected
                              ? "border-[#2e2e2e] bg-[#2e2e2e] text-white"
                              : "border-[#d8c5b0] bg-white text-[#6b5c50]"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-[#6b5c50]">商品備註</p>

            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="可備註：送禮、指定需求等"
              className="min-h-[100px] w-full resize-none rounded-3xl border border-[#e1d3c2] px-4 py-3 text-sm outline-none"
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
              soldOut={Boolean(productSoldOut || variantSoldOut)}
              product={{
                ...product,
                price: displayPrice,
                finalPrice: displayPrice,
                originalPrice,
                finalVipPrice: vipPrice,
                vipLevel,
                isVipPrice: isVip && vipPrice > 0 && originalPrice > vipPrice,
                selectedVariant: selectedVariant || null,
              }}
              selectedOptions={selectedOptions}
              customerNote={customerNote}
              disabled={disabled}
            />

            {productInactive && (
              <p className="mt-2 text-center text-xs text-red-500">
                此商品目前已下架，暫時無法加入購物車
              </p>
            )}

            {productSoldOut && (
              <p className="mt-2 text-center text-xs text-gray-500">
                此商品目前已售完
              </p>
            )}

            {disabled && !productInactive && !productSoldOut && !variantSoldOut && (
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
