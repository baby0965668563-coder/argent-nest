"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  product: any;
  selectedOptions?: Record<string, string>;
  customerNote?: string;
  disabled?: boolean;
  soldOut?: boolean;
}

function normalizeOptions(options: Record<string, string> = {}) {
  return Object.keys(options)
    .sort()
    .reduce((result: Record<string, string>, key) => {
      result[key] = options[key];
      return result;
    }, {});
}

function makeCartKey(product: any, selectedOptions: Record<string, string>) {
  const variantName = product?.selectedVariant?.name || "";
  const optionsKey = JSON.stringify(normalizeOptions(selectedOptions));

  return `${product?.id || ""}__${variantName}__${optionsKey}`;
}

export default function AddToCartButton({
  product,
  selectedOptions = {},
  customerNote = "",
  disabled = false,
  soldOut = false,
}: Props) {
  const router = useRouter();

  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    if (disabled || product?.is_sold_out || soldOut) return;

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const image =
      product?.image ||
      (typeof product?.images === "string"
        ? product.images.split(",")[0]?.trim()
        : Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : "");

    const finalPrice = Number(product?.finalPrice || product?.price || 0);

    const finalVipPrice = Number(product?.finalVipPrice || 0) || null;

    const cartKey = makeCartKey(product, selectedOptions);

    const foundIndex = existingCart.findIndex((item: any) => {
      return item.cartKey === cartKey && (item.note || "") === customerNote;
    });

    if (foundIndex >= 0) {
      existingCart[foundIndex].quantity =
        Number(existingCart[foundIndex].quantity || 1) + 1;
    } else {
      existingCart.push({
        cartKey,

        id: product.id,
        name: product.name,

        price: finalPrice,
        originalPrice: Number(product.originalPrice || product.price || 0),
        vipPrice: finalVipPrice,
        isVipPrice:
          Boolean(product.isVipPrice) ||
          Boolean(finalVipPrice && finalVipPrice < finalPrice),

        image,

        options: normalizeOptions(selectedOptions),
        optionText: Object.entries(normalizeOptions(selectedOptions))
          .map(([key, value]) => `${key}：${value}`)
          .join("｜"),

        note: customerNote,
        quantity: 1,

        selectedVariant: product.selectedVariant || null,
        variantName: product.selectedVariant?.name || "",

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

    window.dispatchEvent(new Event("storage"));

    setAdded(true);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || product?.is_sold_out || soldOut}
        className={`w-full rounded-full py-4 text-sm font-medium transition ${
          disabled || product?.is_sold_out || soldOut
            ? "cursor-not-allowed bg-gray-300 text-white"
            : added
            ? "bg-[#2e2e2e] text-white"
            : "border border-[#d8c5b0] bg-white text-[#6b5c50] hover:bg-[#f8f3ee]"
        }`}
      >
        {product?.is_sold_out || soldOut
          ? "此款式已售完"
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