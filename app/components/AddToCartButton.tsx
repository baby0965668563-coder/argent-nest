"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    if (disabled || product?.is_sold_out) return;

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const image =
      product?.image ||
      (typeof product?.images === "string"
        ? product.images.split(",")[0]?.trim()
        : Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : "");

    const foundIndex = existingCart.findIndex(
      (item: any) =>
        item.id === product.id &&
        sameOptions(item.options, selectedOptions) &&
        (item.note || "") === customerNote
    );

    if (foundIndex >= 0) {
      existingCart[foundIndex].quantity =
        Number(existingCart[foundIndex].quantity || 1) + 1;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        image,
        options: selectedOptions,
        note: customerNote,
        quantity: 1,

        productNote:
          product.product_note ||
          product.note ||
          product.remark ||
          product.notes ||
          "",

        category: product.category || "",
        createdAt: Date.now(),
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    setAdded(true);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || product?.is_sold_out}
        className={`w-full rounded-full py-4 text-sm font-medium transition ${
          disabled || product?.is_sold_out
            ? "bg-gray-300 text-white cursor-not-allowed"
            : added
            ? "bg-[#2e2e2e] text-white"
            : "border border-[#d8c5b0] bg-white text-[#6b5c50] hover:bg-[#f8f3ee]"
        }`}
      >
        {product?.is_sold_out
          ? "已售完"
          : added
          ? "已加入購物車 ☁️"
          : "加入購物車 ☁️"}
      </button>

      {added && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="w-full rounded-full bg-[#f6f1ea] py-3 text-sm font-medium text-[#6b5c50]"
        >
          查看購物車
        </button>
      )}
    </div>
  );
}