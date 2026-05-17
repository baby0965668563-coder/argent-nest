"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LikeButton from "@/app/components/LikeButton";
import AddToCartButton from "@/app/components/AddToCartButton";

type OptionGroup = {
  name: string;
  values: string[];
};

function parseOptions(optionsText: string): OptionGroup[] {
  if (!optionsText) return [];

  return optionsText
    .split("\n")
    .map((line) => {
      const parts = line.includes("|") ? line.split("|") : line.split("：");
      if (parts.length < 2) return null;

      return {
        name: parts[0].trim(),
        values: parts
          .slice(1)
          .join("：")
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
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showWarning, setShowWarning] = useState(false);
  const [customerNote, setCustomerNote] = useState("");
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, []);

  async function fetchProduct() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .eq("is_active", true)
      .single();

    if (data) {
      const productImages =
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : data.image
          ? [data.image]
          : [];

      setProduct(data);
      setSelectedImage(productImages[0] || "");

      const { data: related } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .neq("id", data.id)
        .limit(4);

      setRelatedProducts(related || []);
    }
  }

  if (!product) {
  return (
    <main className="min-h-screen bg-[#f8f5f2] px-5 py-6">
      <div className="mx-auto max-w-md animate-pulse">
        <div className="mb-5 h-12 rounded-full bg-[#ece5dc]" />

        <div className="aspect-square rounded-[2rem] bg-[#ece5dc]" />

        <div className="mt-6 rounded-[2rem] bg-white p-6">
          <div className="mb-4 h-4 w-24 rounded-full bg-[#ece5dc]" />

          <div className="mb-4 h-8 w-3/4 rounded-full bg-[#ece5dc]" />

          <div className="h-10 w-40 rounded-full bg-[#ece5dc]" />

          <div className="mt-8 space-y-3">
            <div className="h-4 rounded-full bg-[#ece5dc]" />
            <div className="h-4 rounded-full bg-[#ece5dc]" />
            <div className="h-4 w-2/3 rounded-full bg-[#ece5dc]" />
          </div>
        </div>
      </div>
    </main>
  );
}

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const optionGroups = parseOptions(product.options || "");
  const soldOut = product.is_sold_out === true;
  const stock = Number(product.stock || 0);

  const isOptionsComplete = optionGroups.every(
    (group) => selectedOptions[group.name]
  );

  const optionText = Object.entries(selectedOptions)
const noteText = customerNote.trim()
  ? `\n備註：${customerNote}`
  : "";
    .map(([key, value]) => `${key}：${value}`)
    .join("\n");

  const productUrl =
  typeof window !== "undefined" ? window.location.href : "";

const lineMessage = [
  `我想詢問：${product.name}`,
  `價格：NT$ ${Number(product.price || 0).toLocaleString()}`,
  product.category ? `分類：${product.category}` : "",
  optionText ? `規格：\n${optionText}` : "",
  customerNote ? `備註：${customerNote}` : "",
  productUrl ? `商品連結：${productUrl}` : "",
]
  .filter(Boolean)
  .join("\n\n");

const lineUrl = `https://line.me/R/oaMessage/@929santn/?${encodeURIComponent(
  lineMessage
)}`;

  function getProductImage(item: any) {
    return (
      item?.image ||
      (Array.isArray(item?.images) && item.images.length > 0
        ? item.images[0]
        : "")
    );
  }

  function openImageViewer(index: number) {
    setViewerIndex(index);
    setImageViewerOpen(true);
  }

  function prevImage() {
    setViewerIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function nextImage() {
    setViewerIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function handleOrder(e: React.MouseEvent<HTMLAnchorElement>) {
    if (soldOut) {
      e.preventDefault();
      return;
    }

    if (optionGroups.length > 0 && !isOptionsComplete) {
      e.preventDefault();
      setShowWarning(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] pb-28 text-black">
      <div className="mx-auto max-w-md">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#eee5dc] bg-[#f8f5f2]/95 px-5 py-4 backdrop-blur">
          <button
            onClick={() => window.history.back()}
            className="rounded-full border border-[#d8c5b0] px-4 py-2 text-sm text-black"
          >
            返回
          </button>

          <h1 className="text-sm font-bold text-black">Argent Nest 🥛🤍</h1>

          <div className="w-[60px]" />
        </div>

        <div className="p-5">
          <button
            type="button"
            onClick={() => {
              const index = images.findIndex((img: string) => img === selectedImage);
              openImageViewer(index >= 0 ? index : 0);
            }}
            className="relative block w-full overflow-hidden rounded-[2rem] bg-white shadow-sm"
          >
            {soldOut && (
              <div className="absolute left-4 top-4 z-10 rounded-full bg-black/80 px-4 py-2 text-xs text-white">
                SOLD OUT
              </div>
            )}

            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className={`aspect-square w-full object-cover ${
                  soldOut ? "opacity-60 grayscale" : ""
                }`}
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-sm text-gray-400">
                No Image
              </div>
            )}

            {selectedImage && (
              <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-xs text-[#6b5c50] shadow">
                點圖放大
              </div>
            )}
          </button>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {images.map((img: string, index: number) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 ${
                    selectedImage === img ? "border-black" : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name}-${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-[2rem] bg-white p-6 text-black shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8b6f5c]">
              Argent Nest
            </p>

            <h2 className="mt-2 text-2xl font-bold leading-tight text-black">
              {product.name}
            </h2>

            <p className="mt-5 text-3xl font-bold text-black">
              NT$ {Number(product.price || 0).toLocaleString()}
            </p>

<div className="mt-4">
  <LikeButton
    productId={product.id}
    initialLikes={Number(product.likes || 0)}
  />
</div>

            <div className="mt-5 inline-block rounded-full bg-[#f5eee7] px-4 py-2 text-sm font-medium text-[#8b6f5c]">
              {product.category}
            </div>

            {soldOut ? (
              <div className="mt-5 rounded-2xl bg-[#f3ede6] p-4 text-sm text-[#8b6f5c]">
                這款目前已售完，暫時不能下單 ☁️
              </div>
            ) : stock > 0 ? (
              <div className="mt-5 rounded-2xl bg-[#edf7ed] p-4 text-sm text-[#2e7d32]">
                現貨剩餘 {stock} 件 ☁️
                {stock <= 3 && (
                  <span className="ml-2 text-red-500">庫存不多了</span>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-[#f5eee7] p-4 text-sm text-[#8b6f5c]">
                此商品為預購商品 ☁️
              </div>
            )}

<AddToCartButton
  product={product}
  selectedOptions={selectedOptions}
customerNote={customerNote}
  disabled={optionGroups.length > 0 && !isOptionsComplete}
/>

            {showWarning && (
              <div className="mt-5 rounded-2xl bg-[#fff1f1] p-4 text-sm text-red-500">
                請先選完商品規格，再私訊下單 ☁️
              </div>
            )}

            {optionGroups.length > 0 && (
              <div className="mt-8 border-t border-[#eee5dc] pt-6">
                <p className="mb-4 text-sm font-bold text-black">選擇規格</p>

                <div className="space-y-5">
                  {optionGroups.map((group) => (
                    <div key={group.name}>
                      <p className="mb-3 text-sm font-bold text-[#6b5c50]">
                        {group.name}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {group.values.map((value) => {
                          const active = selectedOptions[group.name] === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={soldOut}
                              onClick={() => {
                                setSelectedOptions({
                                  ...selectedOptions,
                                  [group.name]: value,
                                });
                                setShowWarning(false);
                              }}
                              className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-50 ${
                                active
                                  ? "border-black bg-black text-white"
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
              </div>
            )}

<div className="mt-8 border-t border-[#eee5dc] pt-6">
  <p className="mb-3 text-sm font-bold text-black">
    商品備註
  </p>

  <textarea
    value={customerNote}
    onChange={(e) => setCustomerNote(e.target.value)}
    placeholder="例如：想要奶油白、送禮用途、想問現貨、其他需求 ☁️"
    className="min-h-[120px] w-full rounded-[1.5rem] border border-[#e8ddd4] bg-white px-5 py-4 text-sm outline-none"
  />
</div>

            {product.description && (
              <div className="mt-8 border-t border-[#eee5dc] pt-6">
                <p className="mb-3 text-sm font-bold text-black">商品介紹</p>

                <p className="whitespace-pre-line text-sm leading-8 text-[#4a4a4a]">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8 border-t border-[#eee5dc] pt-6">
              <p className="mb-3 text-sm font-bold text-black">購買須知</p>

              <div className="space-y-2 text-sm leading-7 text-[#5c5c5c]">
                <p>☁️ 全館為預購商品</p>
                <p>☁️ 出貨約 14–21 天，不含假日與連續假期</p>
                <p>☁️ 無法等待請勿下單</p>
                <p>☁️ 商品顏色以實物為準，螢幕色差請見諒</p>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-10">
              <div className="mb-5">
                <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-[#a08060]">
                  YOU MAY ALSO LIKE
                </p>

                <h3 className="text-2xl font-bold tracking-tight">
                  猜你會喜歡 ☁️
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {relatedProducts.map((item) => {
                  const image = getProductImage(item);

                  return (
                    <a
                      key={item.id}
                      href={`/product/${item.id}`}
                      className="overflow-hidden rounded-[2rem] bg-white shadow-sm"
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-[#f4eee8]">
                        {image ? (
                          <img
                            src={image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-[#b49a88]">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="line-clamp-2 text-sm font-semibold leading-6">
                          {item.name}
                        </p>

                        <p className="mt-2 text-sm font-bold text-[#8b6f5c]">
                          NT$ {Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

<a
  href="/"
  className="mx-5 mt-6 block rounded-full border border-[#d8c5b0] bg-white py-4 text-center text-sm font-medium text-[#6b5c50]"
>
  回首頁繼續逛逛 ☁️
</a>

        <div className="fixed bottom-0 left-0 right-0 border-t border-[#eee5dc] bg-white p-4">
          <div className="mx-auto max-w-md">
            <a
              href={lineUrl}
              onClick={handleOrder}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full rounded-full py-4 text-center text-sm font-medium text-white ${
                soldOut
                  ? "bg-gray-400"
                  : optionGroups.length > 0 && !isOptionsComplete
                  ? "bg-gray-400"
                  : "bg-black"
              }`}
            >
              {soldOut
                ? "已售完"
                : optionGroups.length > 0 && !isOptionsComplete
                ? "請先選擇規格 ☁️"
                : "立即詢問 / 下單 ☁️"}
            </a>
          </div>
        </div>
      </div>

      {imageViewerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-4">
          <button
            type="button"
            onClick={() => setImageViewerOpen(false)}
            className="absolute right-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-black"
          >
            ✕
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-xl font-bold text-black"
            >
              ‹
            </button>
          )}

          {images[viewerIndex] && (
            <img
              src={images[viewerIndex]}
              alt={product.name}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain"
            />
          )}

          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-xl font-bold text-black"
            >
              ›
            </button>
          )}

          <div className="absolute bottom-8 rounded-full bg-white/90 px-5 py-2 text-sm text-black">
            {viewerIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </main>
  );
}