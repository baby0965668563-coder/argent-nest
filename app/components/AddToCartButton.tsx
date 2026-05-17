"use client";

import { useState } from "react";

interface Props {
  product: any;
  selectedOptions?: Record<string, string>;
customerNote?: string;
  disabled?: boolean;
}

function sameOptions(
  a: Record<string, string> = {},
  b: Record<string, string> = {}
) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function AddToCartButton({
  product,
  selectedOptions = {},
customerNote = "",
  disabled = false,
}: Props) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    if (disabled || product?.is_sold_out) return;

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const image =
      product?.image ||
      (Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : "");

    const foundIndex = existingCart.findIndex(
      (item: any) =>
        item.id === product.id && sameOptions(item.options, selectedOptions)
    );

    if (foundIndex >= 0) {
      existingCart[foundIndex].quantity =
        Number(existingCart[foundIndex].quantity || 1) + 1;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image,
        options: selectedOptions,
note: customerNote,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled || product?.is_sold_out}
      className={`mt-3 w-full rounded-full py-4 text-sm font-medium transition ${
        disabled || product?.is_sold_out
          ? "bg-gray-300 text-white"
          : added
          ? "bg-[#2e2e2e] text-white"
          : "border border-[#d8c5b0] bg-white text-[#6b5c50]"
      }`}
    >
      {product?.is_sold_out
        ? "已售完"
        : added
        ? "已加入購物車 ☁️"
        : "加入購物車 ☁️"}
    </button>
  );
}