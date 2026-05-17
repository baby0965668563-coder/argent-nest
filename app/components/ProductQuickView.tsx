"use client";

import { useState } from "react";

type OptionGroup = {
  name: string;
  values: string[];
};

function parseOptions(optionsText: string): OptionGroup[] {
  if (!optionsText) return [];

  return optionsText
    .split("\n")
    .map((line) => {
      const [name, values] = line.split("|");

      if (!name || !values) return null;

      return {
        name: name.trim(),
        values: values
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      };
    })
    .filter((item): item is OptionGroup => item !== null);
}

export default function ProductQuickView({ product }: { product: any }) {
  const [open, setOpen] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showOptionWarning, setShowOptionWarning] = useState(false);

  const soldOut = product?.is_sold_out === true;

  const images: string[] =
    product?.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : product?.image_url
      ? [product.image_url]
      : [];

  const optionGroups = parseOptions(product?.options || "");

  const isOptionsComplete = optionGroups.every(
    (group) => selectedOptions[group.name]
  );

  const optionText = Object.entries(selectedOptions)
    .map(([key, value]) => `${key}：${value}`)
    .join("\n");

  const lineMessage = `我想詢問：${product?.name || ""}${
    optionText ? `\n\n規格：\n${optionText}` : ""
  }`;

  const lineUrl = `https://line.me/R/oaMessage/@929santn/?${encodeURIComponent(
    lineMessage
  )}`;

  function openModal() {
    setMainImage(images[0] || "");
    setSelectedOptions({});
    setShowOptionWarning(false);
    setOpen(true);
  }

  function handleLineClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (soldOut) {
      e.preventDefault();
      return;
    }

    if (optionGroups.length > 0 && !isOptionsComplete) {
      e.preventDefault();
      setShowOptionWarning(true);
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          openModal();
        }}
        className="mt-3 w-full rounded-full border border-[#d8c5b0] py-2 text-xs text-[#6b5c50]"
      >
        快速預覽
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-5">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-[#f8f5f0] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-[#6b5c50]">
                快速預覽 ☁️
              </p>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-[#d8c5b0] px-4 py-2 text-sm text-[#6b5c50]"
              >
                關閉
              </button>
            </div>

            {mainImage && (
              <div className="relative mb-4 overflow-hidden rounded-[1.5rem] bg-[#ede6dd]">
                {soldOut && (
                  <div className="absolute left-4 top-4 z-10 rounded-full bg-black/80 px-4 py-2 text-xs text-white">
                    SOLD OUT
                  </div>
                )}

                <img
                  src={mainImage}
                  alt={product?.name || "商品圖片"}
                  className={`aspect-[4/5] w-full object-cover ${
                    soldOut ? "grayscale opacity-60" : ""
                  }`}
                />
              </div>
            )}

            {images.length > 1 && (
              <div className="mb-5 grid grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    onClick={() => setMainImage(img)}
                    className={`overflow-hidden rounded-xl border bg-[#ede6dd] ${
                      mainImage === img
                        ? "border-[#8b6f5c]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`商品圖片 ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs tracking-[0.25em] text-[#b58b6b]">
              {product?.category || "ARGENT NEST"}
            </p>

            <h3 className="mt-2 text-2xl font-bold text-[#3f332b]">
              {product?.name || "未命名商品"}
            </h3>

            <p className="mt-3 text-2xl font-bold text-[#8b6f5c]">
              NT$ {Number(product?.price || 0).toLocaleString()}
            </p>

            {soldOut && (
              <p className="mt-4 rounded-2xl bg-[#f3ede6] p-4 text-sm text-[#8b6f5c]">
                這款目前已售完，暫時不能下單 ☁️
              </p>
            )}

            {showOptionWarning && (
              <p className="mt-4 rounded-2xl bg-[#fff1f1] p-4 text-sm text-red-500">
                請先選完商品規格，再私訊下單 ☁️
              </p>
            )}

            {optionGroups.length > 0 && (
              <div className="mt-5 rounded-[1.5rem] border border-[#e8ddd4] bg-[#fdf9f6] p-5">
                <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#a08060]">
                  選擇規格
                </p>

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
                                setShowOptionWarning(false);
                              }}
                              className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-50 ${
                                active
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
              </div>
            )}

            <p className="mt-5 line-clamp-4 whitespace-pre-line text-sm leading-8 text-[#6b5c50]">
              {product?.description || ""}
            </p>

            <a
              href={lineUrl}
              onClick={handleLineClick}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 block rounded-full py-4 text-center font-semibold text-white ${
                soldOut
                  ? "bg-gray-400"
                  : optionGroups.length > 0 && !isOptionsComplete
                  ? "bg-gray-400"
                  : "bg-[#06C755]"
              }`}
            >
              {soldOut
                ? "目前已售完 ☁️"
                : optionGroups.length > 0 && !isOptionsComplete
                ? "請先選擇規格 ☁️"
                : "立即詢問 / 下單 ☁️"}
            </a>

            <a
              href={`/product/${product?.id}`}
              className="mt-3 block rounded-full border border-[#d8c5b0] py-4 text-center text-sm text-[#6b5c50]"
            >
              查看完整商品頁
            </a>
          </div>
        </div>
      )}
    </>
  );
}