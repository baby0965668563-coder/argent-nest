"use client";

import { useState } from "react";

export default function ProductQuickView({ product }: { product: any }) {
  const [open, setOpen] = useState(false);

  const soldOut = product.is_sold_out === true;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className="mt-3 w-full rounded-full border border-[#d8c5b0] py-2 text-xs text-[#6b5c50]"
      >
        快速預覽
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-5">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-[#f8f5f0] p-5">
            <button
              onClick={() => setOpen(false)}
              className="mb-4 rounded-full border px-4 py-2 text-sm"
            >
              關閉
            </button>

            {images[0] && (
              <img
                src={images[0]}
                className={`mb-5 aspect-[4/5] w-full rounded-[1.5rem] object-cover ${
                  soldOut ? "grayscale opacity-60" : ""
                }`}
              />
            )}

            <p className="text-xs tracking-[0.25em] text-[#b58b6b]">
              {product.category}
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {product.name}
            </h3>

            <p className="mt-3 text-2xl font-bold text-[#8b6f5c]">
              NT$ {Number(product.price).toLocaleString()}
            </p>

            {soldOut && (
              <p className="mt-4 rounded-2xl bg-[#f3ede6] p-4 text-sm text-[#8b6f5c]">
                這款目前已售完 ☁️
              </p>
            )}

            <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[#6b5c50]">
              {product.description}
            </p>

            <a
              href={`/product/${product.id}`}
              className="mt-6 block rounded-full bg-black py-4 text-center text-white"
            >
              查看完整商品頁
            </a>
          </div>
        </div>
      )}
    </>
  );
}
